import React, { useState } from "react";
import { Search, FileText, Printer, BarChart2 } from "lucide-react";
import InventoryDetails from "../../Modals/InventoryDetails";

const inventory = [
  {
    id: "1",
    brand: "Nike",
    collection: "Summer 2026",
    model: "Basic T-Shirt",
    color: "أبيض",
    available: 420,
    reserved: 80,
    shipped: 300,
  },
  {
    id: "2",
    brand: "Adidas",
    collection: "Kids Collection",
    model: "Oversized Tee",
    color: "أسود",
    available: 215,
    reserved: 40,
    shipped: 160,
  },
  {
    id: "3",
    brand: "Puma",
    collection: "Winter",
    model: "Hoodie",
    color: "رمادي",
    available: 540,
    reserved: 120,
    shipped: 280,
  },
];

const Inventory = () => {
  const [selectedItem, setSelectedItem] = useState(null);

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

        {/* زرار الجرد العام */}
        <button className="flex items-center gap-2 rounded-2xl bg-[#002366] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 w-full md:w-auto justify-center">
          <Printer size={18} />
          طباعة جرد عام للمصنع
        </button>
      </section>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "إجمالي الرصيد بالمخزن", value: "5,420", sub: "قطعة متاحة" },
          { title: "المحجوز للشحن", value: "820", sub: "قطعة" },
          { title: "إجمالي المشحون", value: "3,160", sub: "قطعة" },
          { title: "البراندات النشطة", value: "18", sub: "براند" },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{item.title}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
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
              placeholder="بحث باسم البراند أو الموديل..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-11 pl-4 text-sm outline-none focus:border-[#002366] transition"
            />
          </div>

          <select className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#002366] transition">
            <option>كل البراندات</option>
            <option>Nike</option>
            <option>Adidas</option>
          </select>

          <select className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#002366] transition">
            <option>كل الكولكشنات</option>
            <option>صيفي 2026</option>
            <option>شتوي 2026</option>
          </select>
        </div>
      </section>

      {/* Inventory Cards */}
      <div className="space-y-5">
        {inventory.map((item) => (
          <div
            key={item.id}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* بيانات الموديل */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">
                    {item.brand}
                  </h2>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                    {item.collection}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">الموديل</p>
                    <p className="font-semibold">{item.model}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">اللون</p>
                    <p className="font-semibold">{item.color}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                    <p className="text-xs text-green-600 mb-1">
                      المتاح (الرصيد الفعلي)
                    </p>
                    <p className="font-bold text-green-700">
                      {item.available} قطعة
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                    <p className="text-xs text-orange-600 mb-1">
                      المحجوز للشحن
                    </p>
                    <p className="font-bold text-orange-700">
                      {item.reserved} قطعة
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-600 mb-1">تم شحنه</p>
                    <p className="font-bold text-blue-700">
                      {item.shipped} قطعة
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(item)}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                <BarChart2 size={16} />
                تفاصيل الأرصدة
              </button>
            </div>
          </div>
        ))}
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

export default Inventory;
