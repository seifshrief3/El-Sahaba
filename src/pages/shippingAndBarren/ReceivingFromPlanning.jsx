import React, { useState, useEffect } from "react";
import { Search, CheckCircle2, Package } from "lucide-react";
import { supabase } from "../../../supabase";

const ReceivingFromPlanning = () => {
  const [receivedDeliveries, setReceivedDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. جلب الدفعات اللي تم استلامها بالفعل (أرشيف الدفعات المكتملة)
  useEffect(() => {
    const fetchReceivedDeliveries = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("production_deliveries")
          .select(
            `
            id,
            delivery_number,
            status,
            updated_at,
            created_at,
            production_orders (
              order_number,
              collections (
                name,
                brands (name_ar)
              )
            ),
            production_delivery_items (
              delivered_qty
            )
          `,
          )
          .eq("status", "completed") // 💡 فلترة الدفعات المكتملة (تم استلامها في المخزن)
          .order("updated_at", { ascending: false }); // ترتيب من الأحدث للأقدم

        if (error) throw error;

        // تنسيق الداتا للعرض
        const formattedData = data.map((delivery) => {
          const totalQty =
            delivery.production_delivery_items?.reduce(
              (sum, item) => sum + (item.delivered_qty || 0),
              0,
            ) || 0;

          return {
            db_id: delivery.id,
            deliveryNumber: delivery.delivery_number || "غير محدد",
            orderNumber: delivery.production_orders?.order_number || "غير محدد",
            collectionName:
              delivery.production_orders?.collections?.name || "غير محدد",
            brand:
              delivery.production_orders?.collections?.brands?.name_ar ||
              "غير محدد",
            totalQuantity: totalQty,
            // تحديد تاريخ الاستلام الفعلي بناءً على آخر تحديث لحالة الدفعة
            receivedDate: new Date(
              delivery.updated_at || delivery.created_at,
            ).toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        });

        setReceivedDeliveries(formattedData);
      } catch (error) {
        console.error("Error fetching received deliveries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceivedDeliveries();
  }, []);

  const filteredDeliveries = receivedDeliveries.filter(
    (delivery) =>
      delivery.collectionName.includes(searchTerm) ||
      delivery.brand.includes(searchTerm) ||
      delivery.deliveryNumber.includes(searchTerm),
  );

  return (
    <div className="space-y-6 font-arabic" dir="rtl">
      {/* الهيدر */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <h1 className="text-3xl font-semibold text-[#1a365d]">
            سجل الاستلام من التخطيط
          </h1>
        </div>
        <p className="mt-2 text-sm text-slate-500 mr-12">
          هنا يتم عرض كافة <strong className="text-emerald-700">الدفعات</strong>{" "}
          التي قمت باستلامها بنجاح وتم إدراج كمياتها في أرصدة الجرد الخاصة
          بالمخزن.
        </p>
      </section>

      {/* البحث */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="بحث باسم الكولكشن، البراند، أو رقم الدفعة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-11 pl-4 text-sm outline-none focus:border-[#1a365d]"
          />
        </div>
      </section>

      {/* الكروت (سجل الاستلام) */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="text-center py-10 font-bold text-[#1a365d]">
            جاري تحميل السجل...
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[2rem] border border-slate-200">
            <p className="text-slate-500 font-bold">
              لا توجد دفعات مستلمة حتى الآن.
            </p>
          </div>
        ) : (
          filteredDeliveries.map((delivery) => (
            <div
              key={delivery.db_id}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm border-r-4 border-r-emerald-500 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-[#1a365d]">
                        {delivery.brand}
                      </h2>
                      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono text-xs font-bold border border-slate-200 flex items-center gap-1">
                        <Package size={12} />
                        دفعة {delivery.deliveryNumber}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                      {delivery.collectionName}
                    </p>
                  </div>

                  <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-3">
                    <p>
                      <span className="font-bold text-slate-800">
                        رقم الأمر الأساسي:
                      </span>{" "}
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">
                        {delivery.orderNumber}
                      </span>
                    </p>
                    <p>
                      <span className="font-bold text-slate-800">
                        إجمالي القطع في الدفعة:
                      </span>{" "}
                      <span className="text-[#1a365d] font-black text-lg">
                        {delivery.totalQuantity}
                      </span>{" "}
                      قطعة
                    </p>
                    <p>
                      <span className="font-bold text-slate-800">
                        تاريخ الاستلام:
                      </span>{" "}
                      <span className="text-emerald-700 font-bold">
                        {delivery.receivedDate}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="flex items-center gap-2 rounded-2xl bg-emerald-50 text-emerald-700 px-6 py-3 text-sm font-bold border border-emerald-200">
                    <CheckCircle2 size={18} />
                    تم الاستلام بنجاح
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReceivingFromPlanning;
