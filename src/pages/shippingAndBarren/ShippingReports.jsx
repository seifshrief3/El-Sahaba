import React, { useState } from "react";
import {
  FileText,
  Eye,
  Download,
  Send,
  Filter,
  Calendar,
  Clock,
} from "lucide-react";

const recentReports = [
  {
    id: 101,
    name: "جرد براند",
    brand: "Nike",
    collection: "Summer 2026",
    date: "18 يوليو 2026 - 02:30 م",
  },
  {
    id: 102,
    name: "بيان شحنة #SHP-550",
    brand: "Adidas",
    collection: "Sport",
    date: "18 يوليو 2026 - 11:15 ص",
  },
  {
    id: 103,
    name: "تقرير الرصيد المتبقي",
    brand: "Puma",
    collection: "Basic",
    date: "17 يوليو 2026 - 04:45 م",
  },
];

export default function ShippingReports() {
  // 1. تعريف الـ State لتخزين نوع التقرير المختار
  const [reportType, setReportType] = useState("");

  // 2. قائمة بالتقارير التي تحتاج إلى تحديد فترة زمنية
  const reportsRequiringDates = [
    "تقرير الشحنات خلال فترة",
    "تقرير المرتجعات",
    "جرد براند",
  ];

  // 3. التحقق: هل التقرير المختار يحتاج تواريخ؟
  const isDateNeeded = reportsRequiringDates.includes(reportType);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">تقارير الشحن</h1>
          <p className="mt-2 text-sm text-slate-500">
            إنشاء ومعاينة وتحميل تقارير الشحن والجرد.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Filter size={18} />
            <h2 className="font-semibold">إنشاء تقرير</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-6">
            <select className="rounded-xl border p-2.5 outline-none focus:border-[#002366]">
              <option>البراند</option>
              <option>Nike</option>
              <option>Adidas</option>
            </select>

            <select className="rounded-xl border p-2.5 outline-none focus:border-[#002366]">
              <option>الكولكشن</option>
            </select>

            {/* ربط الـ Select بالـ State */}
            <select
              className="rounded-xl border p-2.5 outline-none focus:border-[#002366]"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="">نوع التقرير...</option>
              <option value="بيان شحنة">بيان شحنة</option>
              <option value="بيان تجهيز شحنة">بيان تجهيز شحنة</option>
              <option value="تقرير الشحنات خلال فترة">
                تقرير الشحنات خلال فترة
              </option>
              <option value="تقرير الرصيد المتبقي">تقرير الرصيد المتبقي</option>
              <option value="جرد براند">جرد براند</option>
              <option value="تقرير المرتجعات">تقرير المرتجعات</option>
            </select>

            {/* حقل "من تاريخ" - يتأثر بالـ State */}
            <div
              className={`relative transition-opacity duration-300 ${!isDateNeeded ? "opacity-50" : ""}`}
            >
              <Calendar
                size={16}
                className="absolute right-3 top-3 text-slate-400"
              />
              <input
                type="date"
                disabled={!isDateNeeded}
                className="w-full rounded-xl border py-2.5 pr-10 pl-3 outline-none focus:border-[#002366] disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            {/* حقل "إلى تاريخ" - يتأثر بالـ State */}
            <div
              className={`relative transition-opacity duration-300 ${!isDateNeeded ? "opacity-50" : ""}`}
            >
              <Calendar
                size={16}
                className="absolute right-3 top-3 text-slate-400"
              />
              <input
                type="date"
                disabled={!isDateNeeded}
                className="w-full rounded-xl border py-2.5 pr-10 pl-3 outline-none focus:border-[#002366] disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <button className="rounded-xl bg-red-800 text-white font-semibold p-2 hover:bg-red-900 transition-colors">
              إنشاء ومعاينة
            </button>
          </div>
        </section>

        {/* ... باقى الكود الخاص بالجدول (لم يتم تغييره) ... */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b p-6">
            <Clock size={18} />
            <h2 className="font-semibold">آخر التقارير</h2>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-right">التقرير</th>
                <th className="p-4 text-right">البراند</th>
                <th className="p-4 text-right">الكولكشن</th>
                <th className="p-4 text-right">التاريخ</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-4 flex items-center gap-2">
                    <FileText size={16} className="text-slate-400" />
                    {r.name}
                  </td>
                  <td className="p-4">{r.brand}</td>
                  <td className="p-4">{r.collection}</td>
                  <td className="p-4">{r.date}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200 transition">
                        <Eye size={16} />
                      </button>
                      <button className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200 transition">
                        <Download size={16} />
                      </button>
                      <button className="rounded-lg bg-green-100 p-2 text-green-700 hover:bg-green-200 transition">
                        <Send size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
