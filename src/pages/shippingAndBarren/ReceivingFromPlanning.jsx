import React from "react";
import { Eye, PackageCheck, Search } from "lucide-react";

const collections = [
  {
    id: "ORD-1024",
    brand: "Nike",
    collection: "Summer 2026",
    models: 5,
    quantity: 820,
    cartons: 18,
    delivery: "اليوم",
    status: "جاهز للاستلام",
  },
  {
    id: "ORD-1025",
    brand: "Adidas",
    collection: "Kids Collection",
    models: 3,
    quantity: 450,
    cartons: 9,
    delivery: "17 يوليو 2026",
    status: "جاهز للاستلام",
  },
  {
    id: "ORD-1026",
    brand: "Puma",
    collection: "Winter Collection",
    models: 7,
    quantity: 1240,
    cartons: 26,
    delivery: "18 يوليو 2026",
    status: "جاهز للاستلام",
  },
];

const ReceivingFromPlanning = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">
          استلام من التخطيط
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          استلام المنتجات النهائية القادمة من قسم التخطيط وإضافتها إلى المخزون.
        </p>
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
              placeholder="بحث برقم الأوردر أو البراند..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-11 pl-4 text-sm outline-none focus:border-[#002366]"
            />
          </div>

          <select className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#002366]">
            <option>كل البراندات</option>
            <option>Nike</option>
            <option>Adidas</option>
            <option>Puma</option>
          </select>

          <select className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#002366]">
            <option>في انتظار الاستلام</option>
            <option>تم الاستلام</option>
          </select>
        </div>
      </section>

      {/* Cards */}
      <div className="space-y-5">
        {collections.map((item) => (
          <div
            key={item.id}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {item.brand}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.collection}
                  </p>
                </div>

                <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-3">
                  <p>
                    <span className="font-medium text-slate-800">
                      رقم الأوردر:
                    </span>{" "}
                    {item.id}
                  </p>

                  <p>
                    <span className="font-medium text-slate-800">
                      عدد الموديلات:
                    </span>{" "}
                    {item.models}
                  </p>

                  <p>
                    <span className="font-medium text-slate-800">
                      إجمالي القطع:
                    </span>{" "}
                    {item.quantity}
                  </p>

                  <p>
                    <span className="font-medium text-slate-800">
                      عدد الكراتين:
                    </span>{" "}
                    {item.cartons}
                  </p>

                  <p>
                    <span className="font-medium text-slate-800">
                      موعد التسليم:
                    </span>{" "}
                    {item.delivery}
                  </p>

                  <div>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                  <Eye size={18} />
                  عرض التفاصيل
                </button>

                <button className="flex items-center gap-2 rounded-2xl bg-red-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-900">
                  <PackageCheck size={18} />
                  استلام
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReceivingFromPlanning;
