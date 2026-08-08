import React, { useState, useEffect } from "react";
import { Plus, Search, Eye, Trash2 } from "lucide-react";
import { supabase } from "../../../supabase"; // تأكد من مسار ملف السوبابيز
import { toast } from "sonner";
import AddNewCustomer from "../../Modals/AddNewCustomer";
import ViewCustomer from "../../Modals/ViewCustomer"; // تأكد إن الملف ده موجود أو اعمله كـ Placeholder

const Customers = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("كل البراندات");
  const [govFilter, setGovFilter] = useState("كل المحافظات");

  // Options for Dropdowns
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableGovs, setAvailableGovs] = useState([]);

  // 💡 دالة جلب العملاء من قاعدة البيانات
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select(
          `
          *,
          brands (name_ar),
          shipments (id)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // تنسيق الداتا
      const formattedData = data.map((c) => ({
        ...c,
        brandName: c.brands?.name_ar || "غير محدد",
        shipmentsCount: c.shipments ? c.shipments.length : 0,
      }));

      setCustomers(formattedData);

      // استخراج البراندات والمحافظات الفريدة للفلاتر
      const brandsSet = new Set(formattedData.map((c) => c.brandName));
      const govsSet = new Set(
        formattedData.map((c) => c.governorate).filter(Boolean),
      );

      setAvailableBrands([...brandsSet]);
      setAvailableGovs([...govsSet]);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("حدث خطأ أثناء تحميل العملاء");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openModal = (type, customer = null) => {
    setSelectedCustomer(customer);
    setActiveModal(type);
  };

  // 💡 دالة حذف العميل
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "هل أنت متأكد من حذف هذا العميل؟ لن يمكنك التراجع عن هذا الإجراء.",
      )
    )
      return;

    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;

      toast.success("تم حذف العميل بنجاح");
      setCustomers(customers.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  // تطبيق الفلاتر
  const filteredCustomers = customers.filter((customer) => {
    const matchSearch =
      customer.name.includes(searchTerm) ||
      (customer.phone && customer.phone.includes(searchTerm));
    const matchBrand =
      brandFilter === "كل البراندات" || customer.brandName === brandFilter;
    const matchGov =
      govFilter === "كل المحافظات" || customer.governorate === govFilter;

    return matchSearch && matchBrand && matchGov;
  });

  return (
    <div className="space-y-6 font-arabic" dir="rtl">
      {/* Header */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#1a365d]">
              عملاء البراندات
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              إدارة العملاء الذين يتم الشحن إليهم لكل براند.
            </p>
          </div>
          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 rounded-2xl bg-red-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-900 shadow-sm"
          >
            <Plus size={18} /> إضافة عميل جديد
          </button>
        </div>
      </section>

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
              placeholder="بحث باسم العميل أو رقم الهاتف..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-11 pl-4 text-sm outline-none focus:border-[#1a365d] transition"
            />
          </div>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1a365d] transition cursor-pointer"
          >
            <option value="كل البراندات">كل البراندات</option>
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={govFilter}
            onChange={(e) => setGovFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1a365d] transition cursor-pointer"
          >
            <option value="كل المحافظات">كل المحافظات</option>
            {availableGovs.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-[#1a365d] text-white">
              <tr className="text-right text-sm font-bold">
                <th className="px-6 py-4">البراند</th>
                <th className="px-6 py-4">اسم العميل</th>
                <th className="px-6 py-4">الهاتف</th>
                <th className="px-6 py-4">المحافظة</th>
                <th className="px-6 py-4">المسؤول</th>
                <th className="px-6 py-4 text-center">عدد الشحنات</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center font-bold text-[#1a365d]"
                  >
                    جاري تحميل البيانات...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center font-bold text-slate-500"
                  >
                    لا يوجد عملاء متطابقين مع البحث.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {customer.brandName}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#1a365d]">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">
                      {customer.phone || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {customer.governorate || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {customer.contact_person || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600 border border-slate-200">
                        {customer.shipmentsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openModal("view", customer)}
                          className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 hover:text-[#1a365d]"
                          title="عرض التفاصيل"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                          title="حذف العميل"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modals Rendering */}
      {activeModal === "add" && (
        <AddNewCustomer
          setOpenModal={() => setActiveModal(null)}
          onSuccess={fetchCustomers} // 💡 بنبعت الدالة دي عشان لما يضيف عميل الجدول يعمل Refresh أوتوماتيك
        />
      )}
      {activeModal === "view" && (
        <ViewCustomer
          customer={selectedCustomer}
          setOpenModal={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};

export default Customers;
