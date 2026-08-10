import React, { useEffect, useState } from "react";
import AddNewBrand from "../../Modals/AddNewBrand";
import {
  handleGetAllBrands,
  handleDeleteBrand,
} from "../../services/brandsService";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link, useLocation } from "react-router-dom";
const Brands = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    handleGetAllBrands().then((data) => {
      setBrands(data);
    });
  }, []);

  const filteredBrands = brands.filter((brand) => {
    const matchSearch =
      (brand.name_ar && brand.name_ar.includes(searchTerm)) ||
      (brand.name_en &&
        brand.name_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (brand.code && brand.code.includes(searchTerm)) ||
      (brand.company_name && brand.company_name.includes(searchTerm));

    const matchStatus =
      statusFilter === "all" ? true : brand.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentBrands = filteredBrands.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (brandId) => {
    const confirmDelete = window.confirm(
      "هل أنت متأكد من حذف هذا البراند؟ لا يمكن التراجع عن هذه الخطوة.",
    );

    if (!confirmDelete) return;

    try {
      await handleDeleteBrand(brandId);

      setBrands((prevBrands) =>
        prevBrands.filter((brand) => brand.id !== brandId),
      );

      toast.success("تم حذف البراند بنجاح!");
    } catch (error) {
      console.error(error);
      toast.error("حصل خطأ أثناء الحذف، يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-arabic" dir="rtl">
      {/* رأس الصفحة وشريط البحث */}
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl flex flex-col gap-6 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[#1a365d] text-2xl font-bold mb-2">
              البراندات
            </h1>
            <p className="text-xs text-slate-500">
              كل بيانات العميل/البراند في مكان واحد — تتسحب تلقائيًا عند إنشاء
              أي كولكشن جديد.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-3xl bg-[#b91c1c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-900 cursor-pointer shadow-sm"
          >
            + إضافة براند
          </button>
        </div>

        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="ابحث بالاسم، الكود، أو اسم العميل..."
            value={searchTerm}
            onChange={handleSearch}
            className="border border-slate-300 p-2.5 rounded-lg text-sm text-slate-700 w-[70%] focus:outline-none focus:border-[#1a365d]"
          />
          <select
            value={statusFilter}
            onChange={handleFilter}
            className="border border-slate-300 p-2.5 rounded-lg text-sm text-slate-700 w-[30%] focus:outline-none focus:border-[#1a365d] bg-white"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط فقط</option>
            <option value="inactive">متوقف فقط</option>
          </select>
        </div>
      </div>

      {/* قائمة البراندات */}
      <div className="max-w-6xl mx-auto mt-6 flex flex-col gap-3">
        {/* نستخدم currentBrands بدل filteredBrands */}
        {currentBrands.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl border border-slate-200 text-slate-500 font-bold">
            لا توجد براندات مطابقة
          </div>
        ) : (
          currentBrands.map((brand) => (
            <div
              key={brand.id}
              className="bg-white p-5 rounded-2xl flex justify-between items-center gap-10 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <h2 className="text-lg font-bold text-[#1a365d] flex items-center gap-3">
                  <span className="flex flex-col text-xl font-bold text-[#1a365d]">
                    {brand.name_ar}
                    <span className="text-xs text-slate-500 flex flex-col mt-0.5">
                      {brand.name_en || "---"}
                    </span>
                  </span>
                  - {brand.code}
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-bold border ml-2 ${
                      brand.status === "active"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-red-50 text-[#b91c1c] border-red-100"
                    }`}
                  >
                    {brand.status === "active" ? "نشط" : "متوقف"}
                  </span>
                </h2>
              </div>
              <div className="flex gap-6 items-center">
                <p className="text-sm font-medium text-slate-500">
                  {brand.collections?.length || 0} كولكشن
                </p>
                <div className="flex gap-3 items-center">
                  <Link
                    // 💡 هنا بنقص الرابط من عند آخر "/" ونحط المسار الجديد مباشرة
                    to={`${location.pathname.substring(0, location.pathname.lastIndexOf("/"))}/edit_brands/${brand.id}`}
                    className="rounded-lg bg-slate-100 border border-slate-200 px-6 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200 hover:text-[#1a365d]"
                  >
                    فتح
                  </Link>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="w-fit bg-[#b91c1c] border border-[#b91c1c] text-white hover:bg-white hover:text-[#b91c1c] p-2.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center"
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. أزرار الـ Pagination (بتظهر بس لو في أكتر من صفحة) */}
      {totalPages > 1 && (
        <div className="max-w-6xl mx-auto mt-6 flex justify-center items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm w-fit">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${
              currentPage === 1
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            السابق
          </button>

          <span className="text-sm font-bold text-slate-600">
            صفحة {currentPage} من {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${
              currentPage === totalPages
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            التالي
          </button>
        </div>
      )}

      {isAddModalOpen && (
        <AddNewBrand
          isAddModalOpen={isAddModalOpen}
          setIsAddModalOpen={setIsAddModalOpen}
        />
      )}
    </div>
  );
};

export default Brands;
