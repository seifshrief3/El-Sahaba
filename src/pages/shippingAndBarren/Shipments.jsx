import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import AddNewShipment from "../../Modals/AddNewShipment";
import ViewShipment from "../../Modals/ViewShipment";

const Shipments = () => {
  const [activeModal, setActiveModal] = useState(null); // 'add', 'view', null
  const [selectedShipment, setSelectedShipment] = useState(null);

  const openModal = (type, shipment = null) => {
    setSelectedShipment(shipment);
    setActiveModal(type);
  };

  const shipments = [
    {
      id: "SHP-2026-001",
      brand: "Nike",
      client: "ستور القاهرة",
      status: "خرجت للشحن",
      date: "18 يوليو",
      courier: "أرامكس",
      cartons: 5,
    },
    {
      id: "SHP-2026-002",
      brand: "Adidas",
      client: "فرع الإسكندرية",
      status: "تم التسليم",
      date: "17 يوليو",
      courier: "مندوب المصنع",
      cartons: 2,
    },
    {
      id: "SHP-2026-003",
      brand: "Puma",
      client: "Fashion Store",
      status: "جاري التجهيز",
      date: "18 يوليو",
      courier: "بوسطة",
      cartons: 3,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">قسم الشحنات</h1>
          <p className="text-slate-500 mt-1">
            إدارة وتتبع الشحنات الخارجة للعملاء.
          </p>
        </div>
        <button
          onClick={() => openModal("add")}
          className="flex items-center gap-2 bg-red-800 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-red-900 transition"
        >
          <Plus size={20} /> إنشاء شحنة جديدة
        </button>
      </section>

      {/* Stats & Filters */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {["الكل", "جاري التجهيز", "خرجت للشحن", "تم التسليم"].map(
            (tab, idx) => (
              <button
                key={tab}
                className={`border py-3 rounded-xl text-sm font-bold transition ${idx === 0 ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:border-red-800 text-slate-700"}`}
              >
                {tab}
              </button>
            ),
          )}
        </div>
        <div className="relative">
          <Search
            className="absolute right-4 top-3.5 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="بحث برقم الشحنة..."
            className="w-full bg-white border border-slate-200 py-3 pr-11 pl-4 rounded-xl text-sm outline-none"
          />
        </div>
      </section>

      {/* Table */}
      <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-6">رقم الشحنة</th>
                <th className="p-6">البراند</th>
                <th className="p-6">العميل</th>
                <th className="p-6">التاريخ</th>
                <th className="p-6">الحالة</th>
                <th className="p-6 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shipments.map((ship) => (
                <tr key={ship.id} className="hover:bg-slate-50">
                  <td className="p-6 font-bold text-[#002366]">{ship.id}</td>
                  <td className="p-6">{ship.brand}</td>
                  <td className="p-6 font-medium">{ship.client}</td>
                  <td className="p-6 text-slate-500">{ship.date}</td>
                  <td className="p-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ship.status === "تم التسليم"
                          ? "bg-green-100 text-green-700"
                          : ship.status === "خرجت للشحن"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {ship.status}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <button
                      onClick={() => openModal("view", ship)}
                      className="text-[#002366] bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 font-bold text-xs transition"
                    >
                      التفاصيل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modals Rendering */}
      {activeModal === "add" && (
        <AddNewShipment setOpenModal={() => setActiveModal(null)} />
      )}
      {activeModal === "view" && (
        <ViewShipment
          shipment={selectedShipment}
          setOpenModal={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};

export default Shipments;
