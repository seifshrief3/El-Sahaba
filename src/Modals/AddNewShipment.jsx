import { X, Plus, Trash2, Box } from "lucide-react";
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { toast } from "sonner";

const AddNewShipment = ({ setOpenModal, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // قوائم البيانات
  const [brands, setBrands] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  // عناصر الشحنة
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentItem, setCurrentItem] = useState("");
  const [currentQty, setCurrentQty] = useState("");

  // بيانات الفورم الأساسية
  const [formData, setFormData] = useState({
    brand_id: "",
    customer_id: "",
    shipping_company: "",
    tracking_number: "",
    status: "preparing",
  });

  useEffect(() => {
    setIsOpen(true);
    fetchBrands();
  }, []);

  const closeModal = () => {
    setIsOpen(false);

    setTimeout(() => {
      setOpenModal(false);
    }, 300);
  };

  const fetchBrands = async () => {
    const { data, error } = await supabase.from("brands").select("id, name_ar");

    if (!error && data) {
      setBrands(data);
    }
  };

  useEffect(() => {
    if (!formData.brand_id) {
      setCustomers([]);
      setInventoryItems([]);
      setSelectedItems([]);
      return;
    }

    const fetchBrandData = async () => {
      // 1. جلب العملاء
      const { data: custData } = await supabase
        .from("customers")
        .select("id, name")
        .eq("brand_id", formData.brand_id);

      if (custData) {
        setCustomers(custData);
      }

      // 2. جلب المقاسات
      const { data: sizesData } = await supabase
        .from("sizes")
        .select("id, name");

      const sizeMap = {};

      if (sizesData) {
        sizesData.forEach((s) => {
          sizeMap[s.id] = s.name;
        });
      }

      // 3. جلب الأرصدة المتاحة
      const { data: invData, error: invError } = await supabase
        .from("inventory")
        .select(
          `
            id,
            size,
            color,
            available_qty,
            models (name),
            production_orders!inner (
              collections!inner (brand_id)
            )
          `,
        )
        .eq("production_orders.collections.brand_id", formData.brand_id)
        .gt("available_qty", 0);

      if (invError) {
        console.error("🚨 خطأ في جلب الأرصدة:", invError);
      }

      if (invData) {
        const formattedInv = invData.map((item) => {
          const realSizeName = sizeMap[item.size] || item.size;

          return {
            id: item.id,
            name: `${item.models?.name} - ${item.color} - مقاس ${realSizeName}`,
            available: item.available_qty,
          };
        });

        setInventoryItems(formattedInv);
      }
    };

    fetchBrandData();
  }, [formData.brand_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddItem = () => {
    if (!currentItem || !currentQty || currentQty <= 0) {
      toast.error("يرجى اختيار المنتج وتحديد كمية صحيحة.");
      return;
    }

    const inventoryRecord = inventoryItems.find((i) => i.id === currentItem);

    if (!inventoryRecord) return;

    if (parseInt(currentQty) > inventoryRecord.available) {
      toast.error(
        `الكمية المطلوبة أكبر من المتاح (${inventoryRecord.available} قطعة).`,
      );
      return;
    }

    const alreadyExists = selectedItems.find(
      (i) => i.inventory_id === currentItem,
    );

    if (alreadyExists) {
      toast.error(
        "هذا المنتج مضاف بالفعل للقائمة، يمكنك حذفه وإضافته بالكمية الجديدة.",
      );
      return;
    }

    setSelectedItems((prev) => [
      ...prev,
      {
        inventory_id: inventoryRecord.id,
        name: inventoryRecord.name,
        quantity: parseInt(currentQty),
        max: inventoryRecord.available,
      },
    ]);

    setCurrentItem("");
    setCurrentQty("");
  };

  const handleRemoveItem = (id) => {
    setSelectedItems((prev) => prev.filter((i) => i.inventory_id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.brand_id || !formData.customer_id) {
      toast.error("يرجى اختيار البراند والعميل.");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("يرجى إضافة موديل واحد على الأقل للشحنة.");
      return;
    }

    setIsSubmitting(true);

    try {
      const shipmentNumber = `SHP-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000,
      )}`;

      // 1. إدخال الشحنة الأساسية
      const { data: newShipment, error: shipError } = await supabase
        .from("shipments")
        .insert([
          {
            shipment_number: shipmentNumber,
            brand_id: formData.brand_id,
            customer_id: formData.customer_id,
            shipping_company: formData.shipping_company,
            tracking_number: formData.tracking_number,
            status: formData.status,
          },
        ])
        .select()
        .single();

      if (shipError) throw shipError;

      // 2. إدخال عناصر الشحنة
      const shipmentItemsData = selectedItems.map((item) => ({
        shipment_id: newShipment.id,
        inventory_id: item.inventory_id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("shipment_items")
        .insert(shipmentItemsData);

      if (itemsError) throw itemsError;

      // 3. تحديث المخزون
      for (const item of selectedItems) {
        const { data: currentInv } = await supabase
          .from("inventory")
          .select("available_qty, reserved_qty, shipped_qty")
          .eq("id", item.inventory_id)
          .single();

        if (currentInv) {
          const isShipped =
            formData.status === "shipped" || formData.status === "delivered";

          await supabase
            .from("inventory")
            .update({
              available_qty: currentInv.available_qty - item.quantity,

              reserved_qty: isShipped
                ? currentInv.reserved_qty
                : currentInv.reserved_qty + item.quantity,

              shipped_qty: isShipped
                ? currentInv.shipped_qty + item.quantity
                : currentInv.shipped_qty,
            })
            .eq("id", item.inventory_id);
        }
      }

      toast.success("تم إنشاء الشحنة وحفظ العناصر بنجاح!");

      if (onSuccess) {
        onSuccess();
      }

      closeModal();
    } catch (error) {
      console.error("Error saving shipment:", error);

      toast.error("حدث خطأ أثناء إنشاء الشحنة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeModal}
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal */}
      <div
        className={`fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[95%] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-[2rem] bg-white shadow-2xl font-arabic transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 p-6 rounded-t-[2rem]">
          <div>
            <h2 className="text-2xl font-bold text-[#1a365d]">
              إنشاء شحنة جديدة
            </h2>

            <p className="mt-1 text-sm text-slate-500 font-medium">
              سيتم خصم الكميات من المخزن عند تأكيد خروج الشحنة.
            </p>
          </div>

          <button
            onClick={closeModal}
            className="rounded-xl p-2.5 bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 transition shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid gap-5 md:grid-cols-2">
              {/* البراند */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  البراند *
                </label>

                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#1a365d] bg-white transition"
                  required
                >
                  <option value="">اختر البراند</option>

                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              {/* العميل */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  العميل المستلم *
                </label>

                <select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#1a365d] bg-white transition disabled:bg-slate-50 disabled:cursor-not-allowed"
                  required
                  disabled={!formData.brand_id}
                >
                  <option value="">اختر عميل البراند</option>

                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* المنتجات */}
              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <label className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1a365d]">
                  <Box size={18} />
                  إضافة موديلات للشحنة (من الأرصدة المتاحة)
                </label>

                <div className="flex flex-col md:flex-row gap-3">
                  <select
                    value={currentItem}
                    onChange={(e) => setCurrentItem(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1a365d] bg-white"
                    disabled={!formData.brand_id || inventoryItems.length === 0}
                  >
                    <option value="">اختر الموديل، اللون، والمقاس...</option>

                    {inventoryItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} (متاح: {item.available})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={currentQty}
                    onChange={(e) => setCurrentQty(e.target.value)}
                    placeholder="الكمية"
                    className="w-full md:w-32 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1a365d] bg-white"
                    disabled={!currentItem}
                  />

                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!currentItem}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#1a365d] px-6 py-3 font-bold text-white transition hover:bg-blue-900 disabled:opacity-50"
                  >
                    <Plus size={18} />
                    إضافة
                  </button>
                </div>

                {/* المنتجات المختارة */}
                {selectedItems.length > 0 && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-slate-100 text-slate-600">
                        <tr>
                          <th className="p-3 font-bold">
                            الموديل واللون والمقاس
                          </th>

                          <th className="w-24 p-3 font-bold">الكمية</th>

                          <th className="w-16 p-3 text-center font-bold">
                            حذف
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {selectedItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-3 font-semibold text-slate-800">
                              {item.name}
                            </td>

                            <td className="p-3 font-bold text-[#1a365d]">
                              {item.quantity}
                            </td>

                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveItem(item.inventory_id)
                                }
                                className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* شركة الشحن */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  شركة الشحن / المندوب
                </label>

                <input
                  type="text"
                  name="shipping_company"
                  value={formData.shipping_company}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#1a365d]"
                  placeholder="أرامكس، بوسطة، مندوب المصنع..."
                />
              </div>

              {/* رقم البوليصة */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  رقم البوليصة (AWB)
                </label>

                <input
                  type="text"
                  name="tracking_number"
                  value={formData.tracking_number}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-left outline-none focus:border-[#1a365d]"
                  placeholder="AWB-12345678"
                  dir="ltr"
                />
              </div>

              {/* الحالة */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  حالة الشحنة المبدئية
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-[#1a365d] outline-none focus:border-[#1a365d]"
                >
                  <option value="preparing">جاري التجهيز (خصم وحجز)</option>

                  <option value="shipped">
                    خرجت للشحن (تم التسليم لشركة الشحن)
                  </option>

                  <option value="delivered">تم التسليم النهائي</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 justify-end gap-3 rounded-b-[2rem] border-t border-slate-200 bg-white p-6">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-red-800 px-8 py-3 font-bold text-white shadow-sm transition hover:bg-red-900 disabled:opacity-50"
            >
              {isSubmitting ? "جاري إنشاء الشحنة..." : "تأكيد وإنشاء الشحنة"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddNewShipment;
