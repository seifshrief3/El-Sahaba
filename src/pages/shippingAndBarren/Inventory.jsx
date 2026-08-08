import React, { useState, useEffect, useRef } from "react";
import { Search, Printer, BarChart2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { supabase } from "../../../supabase";
import InventoryDetails from "../../Modals/InventoryDetails";
import logoImage from "../../assets/logo.jpeg"; // 💡 تأكد من مسار اللوجو حسب هيكلة مشروعك

const Inventory = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [groupedInventory, setGroupedInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState({
    available: 0,
    reserved: 0,
    shipped: 0,
    brands: 0,
  });

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("كل البراندات");
  const [collectionFilter, setCollectionFilter] = useState("كل الكولكشنات");

  // Filter Options (Dynamic)
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCollections, setAvailableCollections] = useState([]);

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `تقرير_جرد_المصنع_${new Date().toLocaleDateString("ar-EG")}`,
  });

  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from("inventory").select(`
          id,
          color,
          size,
          available_qty,
          reserved_qty,
          shipped_qty,
          models ( id, name ),
          production_orders (
            collections (
              id,
              name,
              brands ( id, name_ar )
            )
          )
        `);

        if (error) throw error;

        let totAvail = 0;
        let totRes = 0;
        let totShip = 0;
        const brandsSet = new Set();
        const collectionsSet = new Set();
        const brandsNamesSet = new Set();
        const groups = {};

        data.forEach((item) => {
          totAvail += item.available_qty || 0;
          totRes += item.reserved_qty || 0;
          totShip += item.shipped_qty || 0;

          const collection = item.production_orders?.collections;
          const brand = collection?.brands;
          const model = item.models;

          if (brand) {
            brandsSet.add(brand.id);
            brandsNamesSet.add(brand.name_ar);
          }
          if (collection) collectionsSet.add(collection.name);

          const key = `${collection?.id}-${model?.id}-${item.color}`;

          if (!groups[key]) {
            groups[key] = {
              id: key,
              brand: brand?.name_ar || "غير محدد",
              collection: collection?.name || "غير محدد",
              model: model?.name || "غير محدد",
              color: item.color || "غير محدد",
              available: 0,
              reserved: 0,
              shipped: 0,
              sizes: [],
            };
          }

          groups[key].available += item.available_qty || 0;
          groups[key].reserved += item.reserved_qty || 0;
          groups[key].shipped += item.shipped_qty || 0;

          groups[key].sizes.push({
            size: item.size,
            available: item.available_qty || 0,
            reserved: item.reserved_qty || 0,
            shipped: item.shipped_qty || 0,
          });
        });

        setStats({
          available: totAvail,
          reserved: totRes,
          shipped: totShip,
          brands: brandsSet.size,
        });

        setAvailableBrands([...brandsNamesSet]);
        setAvailableCollections([...collectionsSet]);
        setGroupedInventory(Object.values(groups));
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const filteredInventory = groupedInventory.filter((item) => {
    const matchSearch =
      item.brand.includes(searchTerm) ||
      item.model.includes(searchTerm) ||
      item.color.includes(searchTerm);
    const matchBrand =
      brandFilter === "كل البراندات" || item.brand === brandFilter;
    const matchCollection =
      collectionFilter === "كل الكولكشنات" ||
      item.collection === collectionFilter;

    return matchSearch && matchBrand && matchCollection;
  });

  return (
    <div className="space-y-6 font-arabic" dir="rtl">
      {/* Header */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            المخزون والجرد
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            متابعة الأرصدة الحقيقية واستخراج كشوفات الجرد للبراندات والموديلات.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-2xl bg-red-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-900 w-full md:w-auto justify-center shadow-sm"
        >
          <Printer size={18} />
          طباعة جرد عام للمصنع
        </button>
      </section>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "إجمالي الرصيد بالمخزن",
            value: stats.available.toLocaleString(),
            sub: "قطعة متاحة",
          },
          {
            title: "المحجوز للشحن",
            value: stats.reserved.toLocaleString(),
            sub: "قطعة",
          },
          {
            title: "إجمالي المشحون",
            value: stats.shipped.toLocaleString(),
            sub: "قطعة",
          },
          { title: "البراندات النشطة", value: stats.brands, sub: "براند" },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{item.title}</p>
            <p className="mt-3 text-3xl font-bold text-[#1a365d]">
              {item.value}
            </p>
            <p className="mt-1 text-xs text-slate-400">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باسم البراند، الموديل أو اللون..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-11 pl-4 text-sm outline-none focus:border-[#1a365d] transition"
            />
          </div>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1a365d] transition cursor-pointer"
          >
            <option value="كل البراندات">كل البراندات</option>
            {availableBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <select
            value={collectionFilter}
            onChange={(e) => setCollectionFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1a365d] transition cursor-pointer"
          >
            <option value="كل الكولكشنات">كل الكولكشنات</option>
            {availableCollections.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Inventory Cards */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="text-center py-12 text-[#1a365d] font-bold bg-white rounded-[2rem] border border-slate-200">
            جاري تحميل الأرصدة...
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-bold bg-white rounded-[2rem] border border-slate-200">
            لا توجد أرصدة متطابقة مع بحثك.
          </div>
        ) : (
          filteredInventory.map((item) => (
            <div
              key={item.id}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900">
                      {item.brand}
                    </h2>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium border border-slate-200">
                      {item.collection}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">الموديل</p>
                      <p className="font-semibold text-[#1a365d]">
                        {item.model}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">اللون</p>
                      <p className="font-semibold text-[#1a365d]">
                        {item.color}
                      </p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                      <p className="text-xs text-emerald-600 mb-1">
                        المتاح (الرصيد الفعلي)
                      </p>
                      <p className="font-bold text-emerald-700 text-lg">
                        {item.available}{" "}
                        <span className="text-xs font-normal">قطعة</span>
                      </p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                      <p className="text-xs text-orange-600 mb-1">
                        المحجوز للشحن
                      </p>
                      <p className="font-bold text-orange-700 text-lg">
                        {item.reserved}{" "}
                        <span className="text-xs font-normal">قطعة</span>
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <p className="text-xs text-blue-600 mb-1">تم شحنه</p>
                      <p className="font-bold text-blue-700 text-lg">
                        {item.shipped}{" "}
                        <span className="text-xs font-normal">قطعة</span>
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedItem(item)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 hover:text-[#1a365d]"
                >
                  <BarChart2 size={16} />
                  تفاصيل الأرصدة
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* عنصر الطباعة الخفي */}
      <div style={{ display: "none" }}>
        <PrintableInventoryReport
          ref={componentRef}
          stats={stats}
          inventory={filteredInventory}
          logo={logoImage}
        />
      </div>

      {/* Modal Render */}
      {selectedItem && (
        <InventoryDetails
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
        />
      )}
    </div>
  );
};

// ==========================================
// 💡 مكون تقرير الطباعة متوافق مع هوية "الصحابة"
// ==========================================
import { forwardRef } from "react";

const PrintableInventoryReport = forwardRef(
  ({ stats, inventory, logo }, ref) => {
    return (
      <div
        ref={ref}
        className="p-8 font-arabic bg-white text-slate-900"
        dir="rtl"
      >
        {/* رأس التقرير (الهوية البصرية) */}
        <div className="border-b-4 border-[#1a365d] pb-6 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {logo && (
              <img
                src={logo}
                alt="الصحابة"
                className="w-16 h-16 object-contain rounded-lg border border-slate-200 p-1"
              />
            )}
            <div>
              <h1 className="text-2xl font-black text-[#1a365d]">
                الصحابة لتصنيع وتصدير الملابس
              </h1>
              <p className="text-xs font-bold text-[#b91c1c] mt-0.5">
                نصنع الجودة بخيوط الثقة
              </p>
            </div>
          </div>
          <div className="text-left bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <p className="text-xs font-bold text-slate-500">
              تقرير الجرد العام للمخزن
            </p>
            <p className="text-xs font-black text-[#1a365d] mt-1">
              تاريخ الإصدار: {new Date().toLocaleDateString("ar-EG")}
            </p>
          </div>
        </div>

        {/* ملخص الإحصائيات الشاملة (متناسقة مع الكحلي والأحمر للشركة) */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 border-r-4 border-r-[#1a365d]">
            <p className="text-xs font-bold text-slate-500">
              إجمالي المتاح بالمخزن
            </p>
            <p className="text-xl font-black text-[#1a365d] mt-1">
              {stats.available.toLocaleString()} قطعة
            </p>
          </div>
          <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 border-r-4 border-r-[#b91c1c]">
            <p className="text-xs font-bold text-slate-500">المحجوز للشحن</p>
            <p className="text-xl font-black text-[#b91c1c] mt-1">
              {stats.reserved.toLocaleString()} قطعة
            </p>
          </div>
          <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 border-r-4 border-r-blue-600">
            <p className="text-xs font-bold text-slate-500">إجمالي المشحون</p>
            <p className="text-xl font-black text-[#1a365d] mt-1">
              {stats.shipped.toLocaleString()} قطعة
            </p>
          </div>
          <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 border-r-4 border-r-slate-600">
            <p className="text-xs font-bold text-slate-500">البراندات النشطة</p>
            <p className="text-xl font-black text-[#1a365d] mt-1">
              {stats.brands} براند
            </p>
          </div>
        </div>

        {/* جدول التفاصيل */}
        <div>
          <h3 className="font-bold text-sm text-[#1a365d] mb-3 bg-slate-100 p-2.5 rounded-lg border-r-4 border-[#1a365d]">
            تفاصيل أرصدة الموديلات والألوان الحالية
          </h3>
          <table className="w-full text-right text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-[#1a365d] text-white">
                <th className="border border-slate-300 p-2.5">البراند</th>
                <th className="border border-slate-300 p-2.5">الكولكشن</th>
                <th className="border border-slate-300 p-2.5">الموديل</th>
                <th className="border border-slate-300 p-2.5">اللون</th>
                <th className="border border-slate-300 p-2.5 text-center">
                  المتاح (الفعلي)
                </th>
                <th className="border border-slate-300 p-2.5 text-center">
                  المحجوز
                </th>
                <th className="border border-slate-300 p-2.5 text-center">
                  المشحون
                </th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="border border-slate-300 p-2.5 font-bold text-slate-800">
                    {item.brand}
                  </td>
                  <td className="border border-slate-300 p-2.5 text-slate-600">
                    {item.collection}
                  </td>
                  <td className="border border-slate-300 p-2.5 font-semibold text-[#1a365d]">
                    {item.model}
                  </td>
                  <td className="border border-slate-300 p-2.5 text-slate-700">
                    {item.color}
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center font-bold text-[#1a365d]">
                    {item.available}
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center font-bold text-[#b91c1c]">
                    {item.reserved}
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center font-bold text-blue-700">
                    {item.shipped}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* تذييل صفحة الطباعة */}
        <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 font-bold">
          <p>نظام إدارة أوردرات المصنع - الصحابة لتصنيع وتصدير الملابس</p>
          <p>تم استخراج التقرير أوتوماتيكياً من السيستم الموحد</p>
        </div>
      </div>
    );
  },
);

export default Inventory;
