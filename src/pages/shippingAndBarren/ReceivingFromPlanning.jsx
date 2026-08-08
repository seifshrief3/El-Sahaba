import React, { useState, useEffect } from "react";
import { Search, CheckCircle2, PackageSearch } from "lucide-react";
import { supabase } from "../../../supabase";

const ReceivingFromPlanning = () => {
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. جلب الأوردرات اللي تم استلامها بالفعل (أرشيف)
  useEffect(() => {
    const fetchReceivedOrders = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("production_orders")
          .select(
            `
            id,
            order_number,
            collection_id,
            cartons_count,
            created_at,
            collections (
              name,
              brands (name_ar)
            ),
            production_order_items (
              quantity
            )
          `,
          )
          .eq("status", "completed") // 💡 فلترة الأوردرات المكتملة (تم استلامها)
          .order("id", { ascending: false }); // ترتيب من الأحدث للأقدم

        if (error) throw error;

        // تنسيق الداتا للعرض
        const formattedData = data.map((order) => ({
          db_id: order.id,
          collection_id: order.collection_id,
          orderNumber: order.order_number || order.id.substring(0, 8),
          collectionName: order.collections?.name || "غير محدد",
          brand: order.collections?.brands?.name_ar || "غير محدد",
          cartonsCount: order.cartons_count || 0,
          totalQuantity:
            order.production_order_items?.reduce(
              (sum, item) => sum + item.quantity,
              0,
            ) || 0,
          // تحديد تاريخ تقريبي للاستلام
          receivedDate: new Date(order.created_at).toLocaleDateString("ar-EG"),
        }));

        setReceivedOrders(formattedData);
      } catch (error) {
        console.error("Error fetching received orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceivedOrders();
  }, []);

  const filteredOrders = receivedOrders.filter(
    (order) =>
      order.collectionName.includes(searchTerm) ||
      order.brand.includes(searchTerm),
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
          هنا يتم عرض كافة الكولكشنات التي قمت باستلامها بنجاح وتم إدراج كمياتها
          في أرصدة الجرد الخاصة بالمخزن.
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
            placeholder="بحث باسم الكولكشن أو البراند..."
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
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[2rem] border border-slate-200">
            <p className="text-slate-500 font-bold">
              لا توجد كولكشنات مستلمة حتى الآن.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.db_id}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm border-r-4 border-r-emerald-500 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1a365d]">
                      {order.brand}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {order.collectionName}
                    </p>
                  </div>

                  <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
                    <p>
                      <span className="font-bold text-slate-800">
                        رقم الأوردر:
                      </span>{" "}
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">
                        {order.orderNumber}
                      </span>
                    </p>
                    <p>
                      <span className="font-bold text-slate-800">
                        إجمالي القطع المستلمة:
                      </span>{" "}
                      <span className="text-[#1a365d] font-black">
                        {order.totalQuantity}
                      </span>{" "}
                      قطعة
                    </p>
                    <p>
                      <span className="font-bold text-slate-800">
                        الكراتين المستلمة:
                      </span>{" "}
                      {order.cartonsCount} كرتونة
                    </p>
                    <p>
                      <span className="font-bold text-slate-800">
                        تاريخ الأوردر:
                      </span>{" "}
                      <span className="text-slate-500">
                        {order.receivedDate}
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
