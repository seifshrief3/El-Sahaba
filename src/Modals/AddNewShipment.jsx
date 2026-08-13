import { X, Plus, Trash2, Box, Layers } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../supabase";
import { toast } from "sonner";

const AddNewShipment = ({ setOpenModal, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================
  // قوائم البيانات
  // ============================================================

  const [brands, setBrands] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  const [collections, setCollections] = useState([]);
  const [collectionModels, setCollectionModels] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [selectedCollectionModels, setSelectedCollectionModels] = useState([]);

  // ============================================================
  // عناصر الشحنة اليدوية
  // ============================================================

  const [selectedItems, setSelectedItems] = useState([]);
  const [currentItem, setCurrentItem] = useState("");
  const [currentQty, setCurrentQty] = useState("");

  // ============================================================
  // بيانات الشحنة
  // ============================================================

  const [formData, setFormData] = useState({
    brand_id: "",
    customer_id: "",
    shipping_company: "",
    tracking_number: "",
    status: "preparing",

    // quantity | series
    shipping_type: "quantity",

    series_count: 0,
    broken_qty: 0,
    combined_qty: 0,
  });

  // ============================================================
  // فتح المودال
  // ============================================================

  useEffect(() => {
    setIsOpen(true);
    fetchBrands();
  }, []);

  // ============================================================
  // إغلاق المودال
  // ============================================================

  const closeModal = () => {
    setIsOpen(false);

    setTimeout(() => {
      setOpenModal(false);
    }, 300);
  };

  // ============================================================
  // جلب البراندات
  // ============================================================

  const fetchBrands = async () => {
    const { data, error } = await supabase
      .from("brands")
      .select("id, name_ar")
      .order("name_ar");

    if (!error && data) {
      setBrands(data);
    }
  };

  // ============================================================
  // جلب بيانات البراند
  // ============================================================

  useEffect(() => {
    if (!formData.brand_id) {
      setCustomers([]);
      setInventoryItems([]);
      setCollections([]);
      setCollectionModels([]);
      setSelectedCollectionId("");
      setSelectedCollectionModels([]);
      setSelectedItems([]);
      return;
    }

    const fetchBrandData = async () => {
      // ========================================================
      // 1. العملاء
      // ========================================================

      const { data: custData } = await supabase
        .from("customers")
        .select("id, name")
        .eq("brand_id", formData.brand_id);

      if (custData) {
        setCustomers(custData);
      }

      // ========================================================
      // 2. المقاسات
      // ========================================================

      const { data: sizesData } = await supabase
        .from("sizes")
        .select("id, name");

      const sizeMap = {};

      if (sizesData) {
        sizesData.forEach((s) => {
          sizeMap[s.id] = s.name;
        });
      }

      // ========================================================
      // 3. الكولكشنات الخاصة بالبراند
      // ========================================================

      const { data: collectionsData, error: collectionsError } = await supabase
        .from("collections")
        .select("id, name, code, models_count")
        .eq("brand_id", formData.brand_id)
        .order("created_at", { ascending: false });

      if (collectionsError) {
        console.error("خطأ في جلب الكولكشنات:", collectionsError);
      }

      setCollections(collectionsData || []);

      // ========================================================
      // 4. المخزون المتاح
      // ========================================================

      const { data: invData, error: invError } = await supabase
        .from("inventory")
        .select(
          `
            id,
            model_id,
            size,
            color,
            available_qty,
            models (
              id,
              name,
              model_number,
              collection_id,
              collections (
                id,
                name,
                code,
                brand_id
              )
            ),
            production_orders!inner (
              collections!inner (
                brand_id
              )
            )
          `,
        )
        .eq("production_orders.collections.brand_id", formData.brand_id)
        .gt("available_qty", 0);

      if (invError) {
        console.error("🚨 خطأ في جلب الأرصدة:", invError);
        setInventoryItems([]);
        return;
      }

      if (invData) {
        const formattedInv = invData.map((item) => {
          const realSizeName = sizeMap[item.size] || item.size;

          return {
            id: item.id,
            model_id: item.model_id,
            model_name: item.models?.name || "موديل غير معروف",
            model_number: item.models?.model_number || "-",
            collection_id: item.models?.collection_id || null,
            collection_name: item.models?.collections?.name || "-",
            collection_code: item.models?.collections?.code || "",
            color: item.color || "بدون لون",
            size: realSizeName,
            available: Number(item.available_qty) || 0,

            name: `${item.models?.name || "موديل"} - ${
              item.color || "بدون لون"
            } - مقاس ${realSizeName}`,
          };
        });

        setInventoryItems(formattedInv);
      }
    };

    fetchBrandData();
  }, [formData.brand_id]);

  // ============================================================
  // تغيير بيانات الفورم
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // اختيار الكولكشن
  // ============================================================

  const handleCollectionChange = async (e) => {
    const collectionId = e.target.value;

    setSelectedCollectionId(collectionId);
    setSelectedCollectionModels([]);

    if (!collectionId) {
      setCollectionModels([]);
      return;
    }

    const { data, error } = await supabase
      .from("models")
      .select("id, model_number, name, collection_id")
      .eq("collection_id", collectionId)
      .order("model_number");

    if (error) {
      console.error("خطأ في جلب موديلات الكولكشن:", error);
      toast.error("حدث خطأ أثناء جلب موديلات الكولكشن.");
      return;
    }

    const modelsWithInventory = (data || []).map((model) => {
      const modelInventory = inventoryItems.filter(
        (item) => item.model_id === model.id,
      );

      const totalAvailable = modelInventory.reduce(
        (sum, item) => sum + Number(item.available || 0),
        0,
      );

      // ========================================================
      // حساب عدد السريهات للموديل
      //
      // السري = أقل كمية متاحة في أي مقاس
      // لأن السري الكامل لازم يحتوي على قطعة من كل مقاس.
      // ========================================================

      const sizeTotals = {};

      modelInventory.forEach((item) => {
        const sizeKey = String(item.size);

        if (!sizeTotals[sizeKey]) {
          sizeTotals[sizeKey] = 0;
        }

        sizeTotals[sizeKey] += Number(item.available || 0);
      });

      const sizes = Object.values(sizeTotals);

      const seriesCount = sizes.length > 0 ? Math.min(...sizes.map(Number)) : 0;

      return {
        ...model,
        totalAvailable,
        seriesCount,
        sizeCount: sizes.length,
        seriesPieces: seriesCount > 0 ? seriesCount * sizes.length : 0,
      };
    });

    setCollectionModels(modelsWithInventory);
  };

  // ============================================================
  // تحديد موديلات الكولكشن
  // ============================================================

  const toggleCollectionModel = (modelId) => {
    setSelectedCollectionModels((prev) => {
      if (prev.includes(modelId)) {
        return prev.filter((id) => id !== modelId);
      }

      return [...prev, modelId];
    });
  };

  // ============================================================
  // حساب بيانات الكولكشن المختارة
  // ============================================================

  const collectionShippingSummary = useMemo(() => {
    if (!selectedCollectionId || selectedCollectionModels.length === 0) {
      return {
        modelsCount: 0,
        seriesCount: 0,
        seriesPieces: 0,
        brokenQty: 0,
        combinedQty: 0,
      };
    }

    const selectedModels = collectionModels.filter((model) =>
      selectedCollectionModels.includes(model.id),
    );

    // ========================================================
    // عدد السريهات:
    //
    // كل موديل له عدد سريهات خاص به.
    // إجمالي السريهات = مجموع سريهات الموديلات المختارة.
    // ========================================================

    const seriesCount = selectedModels.reduce(
      (sum, model) => sum + Number(model.seriesCount || 0),
      0,
    );

    // ========================================================
    // عدد القطع التي تكونت من السريهات
    // ========================================================

    const seriesPieces = selectedModels.reduce(
      (sum, model) => sum + Number(model.seriesPieces || 0),
      0,
    );

    return {
      modelsCount: selectedModels.length,
      seriesCount,
      seriesPieces,
      brokenQty: Number(formData.broken_qty || 0),
      combinedQty: seriesCount + Number(formData.broken_qty || 0),
    };
  }, [
    selectedCollectionId,
    selectedCollectionModels,
    collectionModels,
    formData.broken_qty,
  ]);

  // ============================================================
  // إضافة عنصر يدوي
  // ============================================================

  const handleAddItem = () => {
    if (!currentItem || !currentQty || Number(currentQty) <= 0) {
      toast.error("يرجى اختيار المنتج وتحديد كمية صحيحة.");
      return;
    }

    const inventoryRecord = inventoryItems.find((i) => i.id === currentItem);

    if (!inventoryRecord) return;

    if (Number(currentQty) > inventoryRecord.available) {
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
        model_id: inventoryRecord.model_id,
        name: inventoryRecord.name,
        quantity: Number(currentQty),
        max: inventoryRecord.available,
      },
    ]);

    setCurrentItem("");
    setCurrentQty("");
  };

  // ============================================================
  // حذف عنصر
  // ============================================================

  const handleRemoveItem = (id) => {
    setSelectedItems((prev) => prev.filter((i) => i.inventory_id !== id));
  };

  // ============================================================
  // إضافة كل مخزون الموديلات المختارة من الكولكشن
  // ============================================================

  const addCollectionItemsToShipment = () => {
    if (!selectedCollectionId || selectedCollectionModels.length === 0) {
      toast.error("اختر الكولكشن والموديلات أولاً.");
      return;
    }

    const collectionInventory = inventoryItems.filter(
      (item) =>
        item.collection_id === selectedCollectionId &&
        selectedCollectionModels.includes(item.model_id),
    );

    if (collectionInventory.length === 0) {
      toast.error("لا يوجد مخزون متاح للموديلات المختارة.");
      return;
    }

    const newItems = [];

    collectionInventory.forEach((inventoryRecord) => {
      const existingItem = selectedItems.find(
        (item) => item.inventory_id === inventoryRecord.id,
      );

      if (existingItem) {
        return;
      }

      newItems.push({
        inventory_id: inventoryRecord.id,
        model_id: inventoryRecord.model_id,
        name: inventoryRecord.name,
        quantity: inventoryRecord.available,
        max: inventoryRecord.available,
      });
    });

    if (newItems.length === 0) {
      toast.error("الموديلات المختارة مضافة بالفعل للشحنة.");
      return;
    }

    setSelectedItems((prev) => [...prev, ...newItems]);

    toast.success(
      `تمت إضافة مخزون ${selectedCollectionModels.length} موديل للشحنة.`,
    );
  };

  // ============================================================
  // إجمالي الكميات اليدوية
  // ============================================================

  const manualQuantity = useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    );
  }, [selectedItems]);

  // ============================================================
  // حساب المجمع
  //
  // العميل أكد:
  // المجمع = السريهات + المكسر
  // ============================================================

  useEffect(() => {
    const series = Number(formData.series_count || 0);
    const broken = Number(formData.broken_qty || 0);

    setFormData((prev) => {
      const combined = series + broken;

      if (prev.combined_qty === combined) {
        return prev;
      }

      return {
        ...prev,
        combined_qty: combined,
      };
    });
  }, [formData.series_count, formData.broken_qty]);

  // ============================================================
  // عند اختيار نوع الشحن
  // ============================================================

  const handleShippingTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      shipping_type: type,
      series_count: type === "series" ? prev.series_count : 0,
      broken_qty: type === "series" ? prev.broken_qty : 0,
      combined_qty: type === "series" ? prev.combined_qty : 0,
    }));
  };

  // ============================================================
  // إنشاء الشحنة
  // ============================================================

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

    if (formData.shipping_type === "series" && !selectedCollectionId) {
      toast.error("يرجى اختيار الكولكشن عند الشحن بنظام السريهات.");
      return;
    }

    setIsSubmitting(true);

    try {
      const shipmentNumber = `SHP-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000,
      )}`;

      // ========================================================
      // حساب القيم النهائية
      // ========================================================

      const finalSeriesCount =
        formData.shipping_type === "series"
          ? Number(collectionShippingSummary.seriesCount || 0)
          : 0;

      const finalBrokenQty =
        formData.shipping_type === "series"
          ? Number(formData.broken_qty || 0)
          : 0;

      const finalCombinedQty =
        formData.shipping_type === "series"
          ? finalSeriesCount + finalBrokenQty
          : 0;

      // ========================================================
      // 1. إنشاء الشحنة
      // ========================================================

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

            shipping_type: formData.shipping_type,
            series_count: finalSeriesCount,
            broken_qty: finalBrokenQty,
            combined_qty: finalCombinedQty,
          },
        ])
        .select()
        .single();

      if (shipError) throw shipError;

      // ========================================================
      // 2. إدخال عناصر الشحنة
      // ========================================================

      const shipmentItemsData = selectedItems.map((item) => ({
        shipment_id: newShipment.id,
        inventory_id: item.inventory_id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("shipment_items")
        .insert(shipmentItemsData);

      if (itemsError) throw itemsError;

      // ========================================================
      // 3. تحديث المخزون
      // ========================================================

      for (const item of selectedItems) {
        const { data: currentInv, error: inventoryError } = await supabase
          .from("inventory")
          .select("available_qty, reserved_qty, shipped_qty")
          .eq("id", item.inventory_id)
          .single();

        if (inventoryError) {
          throw inventoryError;
        }

        if (currentInv) {
          const isShipped =
            formData.status === "shipped" || formData.status === "delivered";

          const quantity = Number(item.quantity || 0);

          const newAvailable = Math.max(
            0,
            Number(currentInv.available_qty || 0) - quantity,
          );

          const newReserved = isShipped
            ? Number(currentInv.reserved_qty || 0)
            : Number(currentInv.reserved_qty || 0) + quantity;

          const newShipped = isShipped
            ? Number(currentInv.shipped_qty || 0) + quantity
            : Number(currentInv.shipped_qty || 0);

          const { error: updateError } = await supabase
            .from("inventory")
            .update({
              available_qty: newAvailable,
              reserved_qty: newReserved,
              shipped_qty: newShipped,
            })
            .eq("id", item.inventory_id);

          if (updateError) {
            throw updateError;
          }
        }
      }

      // ========================================================
      // نجاح
      // ========================================================

      toast.success("تم إنشاء الشحنة وحفظ العناصر بنجاح!");

      if (onSuccess) {
        onSuccess();
      }

      closeModal();
    } catch (error) {
      console.error("Error saving shipment:", error);

      toast.error(error?.message || "حدث خطأ أثناء إنشاء الشحنة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

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

              {/* ==================================================
                  المنتجات
              ================================================== */}

              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <label className="mb-4 flex items-center gap-2 text-sm font-bold text-[#1a365d]">
                  <Box size={18} />
                  إضافة موديلات للشحنة
                </label>

                {/* ==================================================
                    شحن الكولكشن + اختيار الموديلات
                ================================================== */}

                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers size={18} className="text-[#1a365d]" />

                    <span className="font-bold text-[#1a365d]">
                      شحن من كولكشن
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {/* الكولكشن */}
                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-600">
                        الكولكشن
                      </label>

                      <select
                        value={selectedCollectionId}
                        onChange={handleCollectionChange}
                        disabled={
                          !formData.brand_id || collections.length === 0
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1a365d] bg-white disabled:bg-slate-100"
                      >
                        <option value="">اختر الكولكشن</option>

                        {collections.map((collection) => (
                          <option key={collection.id} value={collection.id}>
                            {collection.name}
                            {collection.code ? ` — ${collection.code}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* طريقة الشحن */}
                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-600">
                        طريقة حساب الشحنة
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleShippingTypeChange("quantity")}
                          className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${
                            formData.shipping_type === "quantity"
                              ? "border-[#1a365d] bg-[#1a365d] text-white"
                              : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          بالكمية
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShippingTypeChange("series")}
                          className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${
                            formData.shipping_type === "series"
                              ? "border-red-800 bg-red-800 text-white"
                              : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          بالسريهات
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* موديلات الكولكشن */}
                  {selectedCollectionId && collectionModels.length > 0 && (
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-600">
                          موديلات الكولكشن
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            if (
                              selectedCollectionModels.length ===
                              collectionModels.length
                            ) {
                              setSelectedCollectionModels([]);
                            } else {
                              setSelectedCollectionModels(
                                collectionModels.map((model) => model.id),
                              );
                            }
                          }}
                          className="text-xs font-bold text-[#1a365d] hover:underline"
                        >
                          {selectedCollectionModels.length ===
                          collectionModels.length
                            ? "إلغاء تحديد الكل"
                            : "تحديد كل الموديلات"}
                        </button>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {collectionModels.map((model) => {
                          const selected = selectedCollectionModels.includes(
                            model.id,
                          );

                          return (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => toggleCollectionModel(model.id)}
                              className={`rounded-xl border p-3 text-right transition ${
                                selected
                                  ? "border-[#1a365d] bg-white ring-1 ring-[#1a365d]"
                                  : "border-slate-200 bg-white hover:border-slate-400"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-bold text-sm text-slate-800">
                                    {model.model_number}
                                    {" — "}
                                    {model.name || "بدون اسم"}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    متاح:{" "}
                                    <span className="font-bold">
                                      {model.totalAvailable}
                                    </span>{" "}
                                    قطعة
                                  </p>
                                </div>

                                <div
                                  className={`h-5 w-5 shrink-0 rounded-md border flex items-center justify-center ${
                                    selected
                                      ? "border-[#1a365d] bg-[#1a365d] text-white"
                                      : "border-slate-300"
                                  }`}
                                >
                                  {selected && (
                                    <span className="text-xs">✓</span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-2 flex gap-2">
                                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                                  {model.sizeCount} مقاسات
                                </span>

                                <span className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-bold text-[#1a365d]">
                                  {model.seriesCount} سري
                                </span>

                                <span className="rounded-lg bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700">
                                  {model.seriesPieces} قطعة/سريهات
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* ملخص الكولكشن */}
                      {selectedCollectionModels.length > 0 && (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <div className="rounded-xl bg-slate-50 p-3 text-center">
                              <p className="text-xs text-slate-500">
                                الموديلات
                              </p>

                              <p className="mt-1 text-xl font-black text-[#1a365d]">
                                {collectionShippingSummary.modelsCount}
                              </p>
                            </div>

                            <div className="rounded-xl bg-blue-50 p-3 text-center">
                              <p className="text-xs text-slate-500">السريهات</p>

                              <p className="mt-1 text-xl font-black text-[#1a365d]">
                                {collectionShippingSummary.seriesCount}
                              </p>
                            </div>

                            <div className="rounded-xl bg-red-50 p-3 text-center">
                              <p className="text-xs text-slate-500">المكسر</p>

                              <p className="mt-1 text-xl font-black text-red-700">
                                {Number(formData.broken_qty || 0)}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-100 p-3 text-center">
                              <p className="text-xs text-slate-500">المجمع</p>

                              <p className="mt-1 text-xl font-black text-slate-800">
                                {collectionShippingSummary.combinedQty}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={addCollectionItemsToShipment}
                            className="mt-4 w-full rounded-xl bg-[#1a365d] px-5 py-3 font-bold text-white transition hover:bg-blue-900"
                          >
                            <Plus size={17} className="inline ml-2" />
                            إضافة الموديلات المختارة للشحنة
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedCollectionId && collectionModels.length === 0 && (
                    <div className="mt-4 rounded-xl bg-white border border-slate-200 p-4 text-center text-sm text-slate-500">
                      لا توجد موديلات في هذا الكولكشن.
                    </div>
                  )}
                </div>

                {/* ==================================================
                    الاختيار اليدوي القديم
                ================================================== */}

                <div className="border-t border-slate-200 pt-4">
                  <label className="mb-3 block text-xs font-bold text-slate-600">
                    أو أضف من الأرصدة المتاحة يدويًا
                  </label>

                  <div className="flex flex-col md:flex-row gap-3">
                    <select
                      value={currentItem}
                      onChange={(e) => setCurrentItem(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1a365d] bg-white"
                      disabled={
                        !formData.brand_id || inventoryItems.length === 0
                      }
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
                </div>

                {/* ==================================================
                    السريهات / المكسر / المجمع
                ================================================== */}

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {/* السريهات */}
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-600">
                      عدد السريهات
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={formData.series_count}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          series_count: e.target.value,
                        }))
                      }
                      disabled={formData.shipping_type !== "series"}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold outline-none focus:border-[#1a365d] disabled:bg-slate-100 disabled:text-slate-400"
                      placeholder="0"
                    />
                  </div>

                  {/* المكسر */}
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-600">
                      المكسر
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={formData.broken_qty}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          broken_qty: e.target.value,
                        }))
                      }
                      disabled={formData.shipping_type !== "series"}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold outline-none focus:border-red-700 disabled:bg-slate-100 disabled:text-slate-400"
                      placeholder="0"
                    />

                    <p className="mt-1 text-[10px] text-slate-500">
                      قطع لا تكفي لتكوين سري كامل.
                    </p>
                  </div>

                  {/* المجمع */}
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-600">
                      المجمع
                    </label>

                    <input
                      type="number"
                      value={formData.combined_qty}
                      readOnly
                      className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 font-black text-[#1a365d] outline-none"
                      placeholder="0"
                    />

                    <p className="mt-1 text-[10px] text-slate-500">
                      السريهات + المكسر.
                    </p>
                  </div>
                </div>

                {/* ==================================================
                    المنتجات المختارة
                ================================================== */}

                {selectedItems.length > 0 && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-100 px-4 py-3">
                      <span className="font-bold text-slate-700">
                        عناصر الشحنة
                      </span>

                      <span className="text-xs font-bold text-[#1a365d]">
                        إجمالي القطع: {manualQuantity}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
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
