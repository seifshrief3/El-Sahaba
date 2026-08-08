import React, { useState, useEffect } from "react";
import { Plus, Search, Box } from "lucide-react";
import { supabase } from "../../../supabase"; // تأكد من المسار
import { toast } from "sonner";
import AddNewShipment from "../../Modals/AddNewShipment";
import ViewShipment from "../../Modals/ViewShipment";

const Shipments = () => {
  const [activeModal, setActiveModal] = useState(null); // 'add', 'view', null
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [activeTab, setActiveTab] = useState("الكل");
  const [searchTerm, setSearchTerm] = useState("");

  // 💡 قواميس لترجمة الحالات بين الداتابيز والواجهة
  const statusToDisplay = {
    preparing: "جاري التجهيز",
    shipped: "خرجت للشحن",
    delivered: "تم التسليم",
  };

  const statusColors = {
    preparing: "bg-amber-100 text-amber-700 border-amber-200",
    shipped: "bg-blue-100 text-blue-700 border-blue-200",
    delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const displayToStatus = {
    "جاري التجهيز": "preparing",
    "خرجت للشحن": "shipped",
    "تم التسليم": "delivered",
  };

  const tabs = ["الكل", "جاري التجهيز", "خرجت للشحن", "تم التسليم"];

  // 💡 دالة جلب الشحنات من قاعدة البيانات
  const fetchShipments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("shipments")
        .select(
          `
          id,
          shipment_number,
          status,
          created_at,
          customers ( name ),
          brands ( name_ar )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // تنسيق البيانات
      const formattedData = data.map((ship) => ({
        db_id: ship.id,
        shipmentNumber:
          ship.shipment_number || ship.id.substring(0, 8).toUpperCase(),
        brand: ship.brands?.name_ar || "غير محدد",
        client: ship.customers?.name || "غير محدد",
        status: ship.status || "preparing",
        date: new Date(ship.created_at).toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      }));

      setShipments(formattedData);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast.error("حدث خطأ أثناء تحميل بيانات الشحنات.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const openModal = (type, shipment = null) => {
    setSelectedShipment(shipment);
    setActiveModal(type);
  };

  // 💡 دالة الفلترة (حسب التاب المختار وكلمة البحث)
  const filteredShipments = shipments.filter((ship) => {
    const matchTab =
      activeTab === "الكل" || ship.status === displayToStatus[activeTab];
    const matchSearch =
      ship.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.client.toLowerCase().includes(searchTerm.toLowerCase());

    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-6 font-arabic" dir="rtl">
      {/* Header */}
      <section className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#1a365d]">قسم الشحنات</h1>
          <p className="text-slate-500 mt-2 text-sm">
            إدارة وتتبع الشحنات الخارجة للعملاء وتحديث حالات التسليم.
          </p>
        </div>
        <button
          onClick={() => openModal("add")}
          className="flex items-center gap-2 bg-red-800 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-900 transition shadow-sm"
        >
          <Plus size={20} /> إنشاء شحنة جديدة
        </button>
      </section>

      {/* Stats & Filters */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border py-3 rounded-xl text-sm font-bold transition shadow-sm ${
                activeTab === tab
                  ? "bg-[#1a365d] text-white border-[#1a365d]"
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث برقم الشحنة أو العميل..."
            className="w-full bg-white border border-slate-200 py-3 pr-11 pl-4 rounded-xl text-sm outline-none focus:border-[#1a365d] transition"
          />
        </div>
      </section>

      {/* Table */}
      <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#1a365d] text-white">
              <tr>
                <th className="p-5 font-bold">رقم الشحنة</th>
                <th className="p-5 font-bold">البراند</th>
                <th className="p-5 font-bold">العميل</th>
                <th className="p-5 font-bold">تاريخ الإنشاء</th>
                <th className="p-5 font-bold">الحالة</th>
                <th className="p-5 text-center font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-10 text-center font-bold text-[#1a365d]"
                  >
                    جاري تحميل بيانات الشحنات...
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-12 text-center text-slate-500 font-bold"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="bg-slate-100 p-4 rounded-full text-slate-400">
                        <Box size={32} />
                      </div>
                      لا توجد شحنات مسجلة حالياً بهذه المواصفات.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredShipments.map((ship) => (
                  <tr
                    key={ship.db_id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-5 font-bold text-[#1a365d] font-mono">
                      #{ship.shipmentNumber}
                    </td>
                    <td className="p-5 font-bold text-slate-700">
                      {ship.brand}
                    </td>
                    <td className="p-5 font-semibold text-slate-800">
                      {ship.client}
                    </td>
                    <td className="p-5 text-slate-500">{ship.date}</td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-1.5 rounded-md text-xs font-bold border ${statusColors[ship.status]}`}
                      >
                        {statusToDisplay[ship.status] || ship.status}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <button
                        onClick={() => openModal("view", ship)}
                        className="text-[#1a365d] bg-blue-50 px-5 py-2 rounded-lg hover:bg-blue-100 font-bold text-xs transition border border-blue-100 shadow-sm"
                      >
                        عرض التفاصيل
                      </button>
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
        <AddNewShipment
          setOpenModal={() => setActiveModal(null)}
          onSuccess={fetchShipments} // 💡 تحديث الجدول تلقائياً بعد إضافة شحنة
        />
      )}
      {activeModal === "view" && (
        <ViewShipment
          shipment={selectedShipment}
          setOpenModal={() => setActiveModal(null)}
          onUpdate={fetchShipments} // 💡 تحديث الجدول إذا تم تغيير حالة الشحنة من الداخل
        />
      )}
    </div>
  );
};

export default Shipments;
