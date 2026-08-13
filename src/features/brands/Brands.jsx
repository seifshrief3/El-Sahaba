import React, { useEffect, useState } from "react";
import AddNewBrand from "../../Modals/AddNewBrand";
import CreateClientAccount from "../../Modals/CreateClientAccount";

import {
  handleGetAllBrands,
  handleDeleteBrand,
} from "../../services/brandsService";

import { Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Link, useLocation } from "react-router-dom";

const Brands = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleOpenCreateAccount = (brand) => {
    setSelectedBrand(brand);
    setIsCreateAccountOpen(true);
  };

  const handleAccountCreated = (updatedBrand) => {
    setBrands((prevBrands) =>
      prevBrands.map((brand) =>
        brand.id === updatedBrand.id
          ? {
              ...brand,
              portal_user_id: updatedBrand.portal_user_id,
            }
          : brand,
      ),
    );
  };

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
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 font-arabic"
      dir="rtl"
    >
      {/* رأس الصفحة وشريط البحث */}
      <div className="max-w-6xl mx-auto bg-white p-5 sm:p-6 rounded-2xl flex flex-col gap-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[#1a365d] text-xl sm:text-2xl font-bold mb-2">
              البراندات
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              كل بيانات العميل/البراند في مكان واحد — تتسحب تلقائيًا عند إنشاء
              أي كولكشن جديد.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto rounded-3xl bg-[#b91c1c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-900 shadow-sm"
          >
            + إضافة براند
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full">
          <input
            type="text"
            placeholder="ابحث بالاسم، الكود، أو اسم العميل..."
            value={searchTerm}
            onChange={handleSearch}
            className="border border-slate-300 p-2.5 rounded-lg text-sm text-slate-700 w-full sm:w-[70%] focus:outline-none focus:border-[#1a365d]"
          />
          <select
            value={statusFilter}
            onChange={handleFilter}
            className="border border-slate-300 p-2.5 rounded-lg text-sm text-slate-700 w-full sm:w-[30%] focus:outline-none focus:border-[#1a365d] bg-white"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط فقط</option>
            <option value="inactive">متوقف فقط</option>
          </select>
        </div>
      </div>

      {/* قائمة البراندات */}
      <div className="max-w-6xl mx-auto mt-6 flex flex-col gap-4">
        {currentBrands.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl border border-slate-200 text-slate-500 font-bold">
            لا توجد براندات مطابقة
          </div>
        ) : (
          currentBrands.map((brand) => (
            <div
              key={brand.id}
              className="bg-white p-4 sm:p-5 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 lg:gap-10 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-full lg:w-auto">
                <h2 className="text-lg font-bold text-[#1a365d] flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="flex flex-col text-lg sm:text-xl font-bold text-[#1a365d]">
                    {brand.name_ar}
                    <span className="text-xs text-slate-500 mt-0.5">
                      {brand.name_en || "---"}
                    </span>
                  </span>
                  <span className="text-slate-400 font-medium">
                    - {brand.code}
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-bold border sm:ml-2 mt-1 sm:mt-0 ${
                      brand.status === "active"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-red-50 text-[#b91c1c] border-red-100"
                    }`}
                  >
                    {brand.status === "active" ? "نشط" : "متوقف"}
                  </span>
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                <p className="text-sm font-medium text-slate-500 whitespace-nowrap">
                  {brand.collections?.length || 0} كولكشن
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3 items-center w-full sm:w-auto">
                  {/* إنشاء حساب العميل */}
                  {!brand.client_portal_user_id ? (
                    <button
                      onClick={() => handleOpenCreateAccount(brand)}
                      className="flex-1 sm:flex-none justify-center rounded-lg bg-[#1a365d] px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white transition hover:bg-blue-900 flex items-center gap-1 sm:gap-2"
                    >
                      <UserPlus size={16} />
                      <span className="whitespace-nowrap">إنشاء حساب</span>
                    </button>
                  ) : (
                    <span className="flex-1 sm:flex-none text-center rounded-lg bg-emerald-50 border border-emerald-100 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-emerald-700 whitespace-nowrap">
                      حساب العميل موجود✓
                    </span>
                  )}

                  {/* فتح */}
                  <Link
                    to={`${location.pathname.substring(0, location.pathname.lastIndexOf("/"))}/edit_brands/${brand.id}`}
                    className="flex-1 sm:flex-none text-center rounded-lg bg-slate-100 border border-slate-200 px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold text-slate-700 transition hover:bg-slate-200 hover:text-[#1a365d]"
                  >
                    فتح
                  </Link>

                  {/* حذف */}
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="bg-[#b91c1c] border border-[#b91c1c] text-white hover:bg-white hover:text-[#b91c1c] p-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center"
                    title="حذف"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* أزرار الـ Pagination */}
      {totalPages > 1 && (
        <div className="max-w-6xl mx-auto mt-6 flex justify-center items-center gap-3 sm:gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm w-fit">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${
              currentPage === 1
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            السابق
          </button>

          <span className="text-xs sm:text-sm font-bold text-slate-600">
            صفحة {currentPage} من {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${
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
      {isCreateAccountOpen && selectedBrand && (
        <CreateClientAccount
          isOpen={isCreateAccountOpen}
          setIsCreateAccountOpen={setIsCreateAccountOpen}
          brand={selectedBrand}
          onAccountCreated={handleAccountCreated}
        />
      )}
    </div>
  );
};

export default Brands;
