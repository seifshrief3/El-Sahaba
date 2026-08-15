import { X, Box, Layers, Package } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../supabase";
import { toast } from "sonner";

const AddNewShipment = ({ setOpenModal, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCollection, setIsLoadingCollection] = useState(false);

  // ============================================================
  // البيانات الأساسية
  // ============================================================

  const [brands, setBrands] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [collections, setCollections] = useState([]);

  // ============================================================
  // بيانات الكولكشن
  // ============================================================

  const [selectedCollectionId, setSelectedCollectionId] = useState("");

  const [collectionModels, setCollectionModels] = useState([]);
  const [selectedCollectionModels, setSelectedCollectionModels] = useState([]);

  // ============================================================
  // أمر التشغيل
  // ============================================================

  const [productionOrder, setProductionOrder] = useState(null);

  /*
    productionOrderItems الشكل المتوقع:

    {
      id,
      model_id,
      variant_key,
      total_quantity,
      part,
      color,
      sizeRows: [
        {
          size_id,
          size_name,
          quantity
        }
      ]
    }
  */

  const [productionOrderItems, setProductionOrderItems] = useState([]);

  // ============================================================
  // السريهات
  // ============================================================

  const [seriesToShip, setSeriesToShip] = useState("");

  // ============================================================
  // المكسر
  // ============================================================

  const [brokenItems, setBrokenItems] = useState([]);

  // ============================================================
  // بيانات الشحنة
  // ============================================================

  const [formData, setFormData] = useState({
    brand_id: "",
    customer_id: "",
    shipping_company: "",
    tracking_number: "",
    status: "preparing",
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
    if (isSubmitting) return;

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

    if (error) {
      console.error("Error fetching brands:", error);
      toast.error("حدث خطأ أثناء جلب البراندات.");
      return;
    }

    setBrands(data || []);
  };

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
  // تغيير البراند
  // ============================================================

  useEffect(() => {
    if (!formData.brand_id) {
      setCustomers([]);
      setCollections([]);
      setSelectedCollectionId("");
      setCollectionModels([]);
      setSelectedCollectionModels([]);
      setProductionOrder(null);
      setProductionOrderItems([]);
      setBrokenItems([]);
      setSeriesToShip("");
      return;
    }

    const fetchBrandData = async () => {
      // ========================================================
      // العملاء
      // ========================================================

      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("id, name")
        .eq("brand_id", formData.brand_id)
        .order("name");

      if (customersError) {
        console.error("Error fetching customers:", customersError);
      }

      setCustomers(customersData || []);

      // ========================================================
      // الكولكشنات
      // ========================================================

      const { data: collectionsData, error: collectionsError } = await supabase
        .from("collections")
        .select("id, name, code, models_count")
        .eq("brand_id", formData.brand_id)
        .order("created_at", { ascending: false });

      if (collectionsError) {
        console.error("Error fetching collections:", collectionsError);
      }

      setCollections(collectionsData || []);

      // Reset
      setSelectedCollectionId("");
      setCollectionModels([]);
      setSelectedCollectionModels([]);
      setProductionOrder(null);
      setProductionOrderItems([]);
      setBrokenItems([]);
      setSeriesToShip("");
    };

    fetchBrandData();
  }, [formData.brand_id]);

  // ============================================================
  // تحميل الكولكشن + أمر التشغيل
  // ============================================================

  const handleCollectionChange = async (e) => {
    const collectionId = e.target.value;

    setSelectedCollectionId(collectionId);
    setSelectedCollectionModels([]);
    setBrokenItems([]);
    setSeriesToShip("");
    setCollectionModels([]);
    setProductionOrder(null);
    setProductionOrderItems([]);

    if (!collectionId) return;

    setIsLoadingCollection(true);

    try {
      // 1. جلب الموديلات
      const { data: modelsData, error: modelsError } = await supabase
        .from("models")
        .select("id, model_number, name, collection_id")
        .eq("collection_id", collectionId)
        .order("model_number");

      if (modelsError) throw modelsError;

      if (!modelsData || modelsData.length === 0) {
        setCollectionModels([]);
        toast.warning("لا توجد موديلات في هذا الكولكشن.");
        return;
      }

      // 2. جلب المقاسات
      const { data: sizesData, error: sizesError } = await supabase
        .from("sizes")
        .select("id, name, sort_order")
        .order("sort_order");

      if (sizesError) throw sizesError;

      const sizeMap = {};
      (sizesData || []).forEach((size) => {
        sizeMap[String(size.id)] = {
          name: size.name,
          sort_order: size.sort_order,
        };
        sizeMap[String(size.name)] = {
          name: size.name,
          sort_order: size.sort_order,
        };
      });

      // 💡 3. جلب المخزون الحقيقي من الداتابيز هنا بدري
      const modelIds = modelsData.map((m) => m.id);
      const { data: inventoryData, error: invError } = await supabase
        .from("inventory")
        .select("model_id, size, available_qty")
        .in("model_id", modelIds);

      if (invError) throw invError;

      // 4. جلب أمر التشغيل
      const { data: orderData, error: orderError } = await supabase
        .from("production_orders")
        .select(
          `id, collection_id, order_number, status, total_quantity, total_amount`,
        )
        .eq("collection_id", collectionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (orderError) throw orderError;

      if (!orderData) {
        toast.error("لا يوجد أمر تشغيل لهذا الكولكشن.");
        setProductionOrder(null);
      } else {
        setProductionOrder(orderData);
      }

      // 5. تجهيز الموديلات وربطها بالمخزون
      const modelsWithSizes = modelsData.map((model) => {
        // فلترة المخزون الخاص بالموديل ده
        const modelInventory = (inventoryData || []).filter(
          (item) => item.model_id === model.id,
        );

        const sizeMapForModel = {};

        modelInventory.forEach((item) => {
          const sizeName =
            sizeMap[String(item.size)]?.name || String(item.size);

          if (!sizeMapForModel[sizeName]) {
            sizeMapForModel[sizeName] = {
              name: sizeName,
              sort_order: sizeMap[String(item.size)]?.sort_order ?? 999,
              availableQty: 0, // هنجمع هنا
            };
          }
          // تجميع الكميات المتاحة للمقاس ده (لو متكرر بألوان مختلفة نجمعه)
          sizeMapForModel[sizeName].availableQty += Number(
            item.available_qty || 0,
          );
        });

        const sizes = Object.values(sizeMapForModel).sort(
          (a, b) => a.sort_order - b.sort_order,
        );

        return {
          ...model,
          sizes,
          sizeCount: sizes.length,
        };
      });

      setCollectionModels(modelsWithSizes);
    } catch (error) {
      console.error("Error loading collection:", error);
      toast.error("حدث خطأ أثناء تحميل بيانات الكولكشن.");
    } finally {
      setIsLoadingCollection(false);
    }
  };

  // ============================================================
  // تحديد موديل
  // ============================================================

  const toggleCollectionModel = (modelId) => {
    setSelectedCollectionModels((prev) => {
      if (prev.includes(modelId)) {
        return prev.filter((id) => id !== modelId);
      }

      return [...prev, modelId];
    });

    setBrokenItems([]);
    setSeriesToShip("");
  };

  // ============================================================
  // تحديد كل الموديلات
  // ============================================================

  const toggleAllModels = () => {
    if (selectedCollectionModels.length === collectionModels.length) {
      setSelectedCollectionModels([]);
    } else {
      setSelectedCollectionModels(collectionModels.map((model) => model.id));
    }

    setBrokenItems([]);
    setSeriesToShip("");
  };

  // ============================================================
  // الموديلات المختارة
  // ============================================================

  const selectedModels = useMemo(() => {
    return collectionModels.filter((model) =>
      selectedCollectionModels.includes(model.id),
    );
  }, [collectionModels, selectedCollectionModels]);

  // ============================================================
  // المقاسات المشتركة
  // ============================================================

  const commonSizes = useMemo(() => {
    if (selectedModels.length === 0) {
      return [];
    }

    const firstModelSizes = selectedModels[0]?.sizes || [];

    return firstModelSizes.filter((size) => {
      return selectedModels.every((model) =>
        model.sizes.some((modelSize) => modelSize.name === size.name),
      );
    });
  }, [selectedModels]);

  // ============================================================
  // الحصول على Items الخاصة بموديل
  // ============================================================

  const getProductionItemsForModel = (modelId) => {
    return productionOrderItems.filter((item) => item.model_id === modelId);
  };

  // ============================================================
  // الحصول على كمية أمر التشغيل لموديل + مقاس
  //
  // لو عندنا Variant واحد:
  //
  // Model 1 / S = 40
  //
  // لو عندنا أكثر من Variant:
  //
  // Variant 1 / S = 40
  // Variant 2 / S = 40
  //
  // بنستخدم أقل كمية متاحة بينهم كسريهات يمكن شحنها
  // علشان ما نشحنش Variant أكثر من الموجود في أمر التشغيل.
  // ============================================================

  const getOrderSeriesForModelSize = (modelId, sizeName) => {
    const items = getProductionItemsForModel(modelId);

    if (items.length === 0) {
      return 0;
    }

    const quantities = [];

    items.forEach((item) => {
      const sizeRow = item.sizeRows.find((row) => row.size_name === sizeName);

      if (sizeRow) {
        quantities.push(Number(sizeRow.quantity || 0));
      }
    });

    if (quantities.length === 0) {
      return 0;
    }

    return Math.min(...quantities);
  };

  // ============================================================
  // إجمالي السريهات المتاحة
  //
  // مهم جدًا:
  //
  // مش:
  // models × sizes
  //
  // لكن بنجيب عدد السريهات من أمر التشغيل نفسه.
  //
  // مثال:
  //
  // Model 1:
  // S = 40
  // M = 40
  // ...
  //
  // Model 2:
  // S = 40
  //
  // Model 3:
  // S = 40
  //
  // النتيجة = 40 سري.
  //
  // بنأخذ MIN بين كل model/size.
  // ============================================================

  const totalSeries = useMemo(() => {
    if (selectedModels.length === 0 || commonSizes.length === 0) {
      return 0;
    }

    const allAvailableQuantities = [];

    selectedModels.forEach((model) => {
      commonSizes.forEach((commonSize) => {
        // بندور على المقاس ده في الموديل وبنجيب الكمية المتاحة
        const modelSizeData = model.sizes.find(
          (s) => s.name === commonSize.name,
        );
        const available = modelSizeData ? modelSizeData.availableQty : 0;

        allAvailableQuantities.push(available);
      });
    });

    if (allAvailableQuantities.length === 0) return 0;

    // السري هو أقل كمية متاحة من أي قطعة في الطقم
    return Math.min(...allAvailableQuantities);
  }, [selectedModels, commonSizes]);

  // ============================================================
  // عدد القطع في السري الواحد
  //
  // 3 موديلات × 5 مقاسات = 15 قطعة
  // ============================================================

  const piecesPerSeries = useMemo(() => {
    return selectedModels.length * commonSizes.length;
  }, [selectedModels, commonSizes]);

  // ============================================================
  // السريهات المطلوبة
  // ============================================================

  const requestedSeries = Math.max(0, Math.floor(Number(seriesToShip) || 0));

  // ============================================================
  // السريهات المتبقية
  // ============================================================

  const remainingSeries = Math.max(0, totalSeries - requestedSeries);

  // ============================================================
  // القطع الناتجة عن السريهات
  // ============================================================

  const seriesPieces = requestedSeries * piecesPerSeries;

  // ============================================================
  // المكسر
  // ============================================================

  const brokenQty = useMemo(() => {
    return brokenItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    );
  }, [brokenItems]);

  // ============================================================
  // المجمع
  // ============================================================

  const combinedQty = seriesPieces + brokenQty;

  // ============================================================
  // تعديل كمية المكسر
  // ============================================================

  const updateBrokenQuantity = (modelId, modelNumber, modelName, size, qty) => {
    const quantity = Math.max(0, Math.floor(Number(qty) || 0));

    setBrokenItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.model_id === modelId && item.size === size,
      );

      if (quantity === 0) {
        if (existingIndex === -1) {
          return prev;
        }

        return prev.filter((_, index) => index !== existingIndex);
      }

      const newItem = {
        model_id: modelId,
        model_number: modelNumber,
        model_name: modelName,
        size,
        quantity,
      };

      if (existingIndex === -1) {
        return [...prev, newItem];
      }

      return prev.map((item, index) =>
        index === existingIndex ? newItem : item,
      );
    });
  };

  // ============================================================
  // كمية مكسر
  // ============================================================

  const getBrokenQuantity = (modelId, size) => {
    const item = brokenItems.find(
      (broken) => broken.model_id === modelId && broken.size === size,
    );

    return item?.quantity || "";
  };

  // ============================================================
  // Validation
  // ============================================================

  const validateShipment = () => {
    if (!formData.brand_id) {
      toast.error("يرجى اختيار البراند.");
      return false;
    }

    if (!formData.customer_id) {
      toast.error("يرجى اختيار العميل المستلم.");
      return false;
    }

    if (!selectedCollectionId) {
      toast.error("يرجى اختيار الكولكشن.");
      return false;
    }

    if (!productionOrder) {
      toast.error("لا يوجد أمر تشغيل لهذا الكولكشن.");
      return false;
    }

    if (selectedModels.length === 0) {
      toast.error("يرجى اختيار موديل واحد على الأقل.");
      return false;
    }

    if (commonSizes.length === 0) {
      toast.error("لا توجد مقاسات مشتركة بين الموديلات المختارة.");
      return false;
    }

    if (totalSeries <= 0) {
      toast.error("لا توجد سريهات متاحة في أمر التشغيل.");
      return false;
    }

    if (requestedSeries <= 0) {
      toast.error("يرجى إدخال عدد السريهات المراد شحنها.");
      return false;
    }

    if (requestedSeries > totalSeries) {
      toast.error(
        `عدد السريهات المطلوب (${requestedSeries}) أكبر من السريهات المتاحة (${totalSeries}).`,
      );
      return false;
    }

    return true;
  };

  // ============================================================
  // رقم الشحنة
  // ============================================================

  const generateShipmentNumber = () => {
    return `SHP-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;
  };

  // ============================================================
  // إنشاء الشحنة
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateShipment()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const shipmentNumber = generateShipmentNumber();

      // ========================================================
      // 1. إنشاء الشحنة
      // ========================================================

      const { data: newShipment, error: shipmentError } = await supabase
        .from("shipments")
        .insert([
          {
            shipment_number: shipmentNumber,
            brand_id: formData.brand_id,
            customer_id: formData.customer_id,
            shipping_company: formData.shipping_company || null,
            tracking_number: formData.tracking_number || null,
            status: formData.status,

            shipping_type: "series",

            // عدد السريهات الحقيقي
            series_count: requestedSeries,

            broken_qty: brokenQty,

            combined_qty: combinedQty,
          },
        ])
        .select()
        .single();

      if (shipmentError) {
        throw shipmentError;
      }

      // ========================================================
      // 2. جلب المخزون
      // ========================================================

      const { data: inventoryData, error: inventoryError } = await supabase
        .from("inventory")
        .select(
          `
          id,
          model_id,
          size,
          color,
          available_qty,
          reserved_qty,
          shipped_qty
        `,
        )
        .in(
          "model_id",
          selectedModels.map((model) => model.id),
        )
        .gt("available_qty", 0);

      if (inventoryError) {
        throw inventoryError;
      }

      // ========================================================
      // 3. جلب المقاسات
      // ========================================================

      const { data: sizesData, error: sizesError } = await supabase
        .from("sizes")
        .select("id, name");

      if (sizesError) {
        throw sizesError;
      }

      const sizeMap = {};

      (sizesData || []).forEach((size) => {
        sizeMap[String(size.id)] = size.name;
        sizeMap[String(size.name)] = size.name;
      });

      const normalizeSize = (rawSize) => {
        return sizeMap[String(rawSize)] || String(rawSize);
      };

      // ========================================================
      // 4. تجهيز عناصر الشحنة
      // ========================================================

      const shipmentItemsData = [];

      // ========================================================
      // 5. تخصيص من المخزون
      // ========================================================

      const allocateInventory = async (modelId, sizeName, requiredQty) => {
        let remaining = requiredQty;

        const matchingInventory = (inventoryData || []).filter(
          (item) =>
            item.model_id === modelId &&
            normalizeSize(item.size) === sizeName &&
            Number(item.available_qty || 0) > 0,
        );

        for (const inventoryRecord of matchingInventory) {
          if (remaining <= 0) break;

          const available = Number(inventoryRecord.available_qty || 0);

          const take = Math.min(available, remaining);

          if (take <= 0) continue;

          // ====================================================
          // إضافة shipment item
          // ====================================================

          shipmentItemsData.push({
            shipment_id: newShipment.id,
            inventory_id: inventoryRecord.id,
            quantity: take,
          });

          // ====================================================
          // تحديث المخزون
          // ====================================================

          const isShipped =
            formData.status === "shipped" || formData.status === "delivered";

          const currentAvailable = Number(inventoryRecord.available_qty || 0);

          const currentReserved = Number(inventoryRecord.reserved_qty || 0);

          const currentShipped = Number(inventoryRecord.shipped_qty || 0);

          const newAvailable = Math.max(0, currentAvailable - take);

          const newReserved = isShipped
            ? currentReserved
            : currentReserved + take;

          const newShipped = isShipped ? currentShipped + take : currentShipped;

          const { error: updateInventoryError } = await supabase
            .from("inventory")
            .update({
              available_qty: newAvailable,
              reserved_qty: newReserved,
              shipped_qty: newShipped,
            })
            .eq("id", inventoryRecord.id);

          if (updateInventoryError) {
            throw updateInventoryError;
          }

          // تحديث النسخة الموجودة في الذاكرة
          inventoryRecord.available_qty = newAvailable;
          inventoryRecord.reserved_qty = newReserved;
          inventoryRecord.shipped_qty = newShipped;

          remaining -= take;
        }

        if (remaining > 0) {
          throw new Error(
            `المخزون غير كافٍ للموديل والمقاس ${sizeName}. المتبقي المطلوب: ${remaining} قطعة.`,
          );
        }
      };

      // ========================================================
      // 6. خصم السريهات من الـ Inventory
      // ========================================================

      for (const model of selectedModels) {
        for (const size of commonSizes) {
          await allocateInventory(model.id, size.name, requestedSeries);
        }
      }

      // ========================================================
      // 7. خصم المكسر
      // ========================================================

      const brokenRows = [];

      for (const brokenItem of brokenItems) {
        const quantity = Number(brokenItem.quantity || 0);

        if (quantity <= 0) continue;

        const matchingInventory = (inventoryData || []).find(
          (item) =>
            item.model_id === brokenItem.model_id &&
            normalizeSize(item.size) === brokenItem.size,
        );

        await allocateInventory(brokenItem.model_id, brokenItem.size, quantity);

        brokenRows.push({
          shipment_id: newShipment.id,
          model_id: brokenItem.model_id,
          inventory_id: matchingInventory?.id || null,
          size: brokenItem.size,
          quantity,
        });
      }

      // ========================================================
      // 8. إدخال shipment_items
      // ========================================================

      if (shipmentItemsData.length > 0) {
        const { error: shipmentItemsError } = await supabase
          .from("shipment_items")
          .insert(shipmentItemsData);

        if (shipmentItemsError) {
          throw shipmentItemsError;
        }
      }

      // ========================================================
      // 9. إدخال shipment_broken_items
      // ========================================================

      if (brokenRows.length > 0) {
        const { error: brokenError } = await supabase
          .from("shipment_broken_items")
          .insert(brokenRows);

        if (brokenError) {
          throw brokenError;
        }
      }

      // ========================================================
      // 10. تحديث أمر التشغيل
      //
      // هنا كان الجزء الناقص
      //
      // مثال:
      //
      // قبل الشحن:
      // S = 40
      // M = 40
      // L = 40
      //
      // شحن 5:
      // S = 35
      // M = 35
      // L = 35
      //
      // وبالتالي الـ series المتاحة تصبح 35
      // ========================================================

      for (const model of selectedModels) {
        const modelItems = productionOrderItems.filter(
          (item) => item.model_id === model.id,
        );

        for (const item of modelItems) {
          // ----------------------------------------------------
          // المقاسات الموجودة فعليًا في الـ item
          // والتي تدخل ضمن الشحنة
          // ----------------------------------------------------

          const itemSizeRowsToUpdate = item.sizeRows.filter((sizeRow) =>
            commonSizes.some((size) => size.name === sizeRow.size_name),
          );

          if (itemSizeRowsToUpdate.length === 0) {
            continue;
          }

          // ----------------------------------------------------
          // تحديث production_order_item_sizes
          // ----------------------------------------------------

          let itemShippedQuantity = 0;

          for (const sizeRow of itemSizeRowsToUpdate) {
            const currentQuantity = Number(sizeRow.quantity || 0);

            const newQuantity = Math.max(0, currentQuantity - requestedSeries);

            itemShippedQuantity += Math.min(currentQuantity, requestedSeries);

            const { error: updateSizeError } = await supabase
              .from("production_order_item_sizes")
              .update({
                quantity: newQuantity,
              })
              .eq("production_order_item_id", item.id)
              .eq("size_id", sizeRow.size_id);

            if (updateSizeError) {
              throw updateSizeError;
            }
          }

          // ----------------------------------------------------
          // تحديث production_order_items.total_quantity
          // ----------------------------------------------------

          const currentItemTotal = Number(item.total_quantity || 0);

          const newItemTotal = Math.max(
            0,
            currentItemTotal - itemShippedQuantity,
          );

          const { error: updateItemError } = await supabase
            .from("production_order_items")
            .update({
              total_quantity: newItemTotal,
            })
            .eq("id", item.id);

          if (updateItemError) {
            throw updateItemError;
          }
        }
      }

      // ========================================================
      // 11. تحديث إجمالي أمر التشغيل
      //
      // لا نحسبه من selectedModels.length فقط.
      //
      // عدد القطع التي خرجت من أمر التشغيل فعليًا هو:
      //
      // requestedSeries × عدد الموديلات × عدد المقاسات
      //
      // ========================================================

      const productionOrderShippedQty = seriesPieces;

      const currentProductionOrderQty = Number(
        productionOrder.total_quantity || 0,
      );

      const newProductionOrderQty = Math.max(
        0,
        currentProductionOrderQty - productionOrderShippedQty,
      );

      // ========================================================
      // 12. تحديث إجمالي مبلغ أمر التشغيل
      //
      // قيمة القطع المشحونة من كل Production Order Item
      // ========================================================

      let shippedAmount = 0;

      for (const model of selectedModels) {
        const modelItems = productionOrderItems.filter(
          (item) => item.model_id === model.id,
        );

        for (const item of modelItems) {
          const itemSizeCount = item.sizeRows.filter((sizeRow) =>
            commonSizes.some((size) => size.name === sizeRow.size_name),
          ).length;

          const itemShippedQty = requestedSeries * itemSizeCount;

          shippedAmount += itemShippedQty * Number(item.selling_price || 0);
        }
      }

      const currentProductionOrderAmount = Number(
        productionOrder.total_amount || 0,
      );

      const newProductionOrderAmount = Math.max(
        0,
        currentProductionOrderAmount - shippedAmount,
      );

      // ========================================================
      // 13. تحديد حالة أمر التشغيل
      //
      // لو مفيش قطع متبقية -> completed
      // غير كده يفضل pending
      // ========================================================

      const newProductionOrderStatus =
        newProductionOrderQty <= 0 ? "completed" : "pending";

      const { error: updateProductionOrderError } = await supabase
        .from("production_orders")
        .update({
          total_quantity: newProductionOrderQty,
          total_amount: newProductionOrderAmount,
          status: newProductionOrderStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productionOrder.id);

      if (updateProductionOrderError) {
        throw updateProductionOrderError;
      }

      // ========================================================
      // 14. نجاح
      // ========================================================

      toast.success(
        `تم إنشاء الشحنة بنجاح — ${requestedSeries} سري / ${combinedQty} قطعة.`,
      );

      if (onSuccess) {
        onSuccess();
      }

      closeModal();
    } catch (error) {
      console.error("Error creating shipment:", error);

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
        className={`fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[95%] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-[2rem] bg-white font-arabic shadow-2xl transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between rounded-t-[2rem] border-b border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a365d] text-white">
              <Package size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1a365d]">
                إنشاء شحنة جديدة
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                الشحن يتم بناءً على أمر التشغيل.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-400 shadow-sm transition hover:bg-red-50 hover:text-red-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid gap-5 md:grid-cols-2">
              {/* ==================================================
                  البراند
              ================================================== */}

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  البراند *
                </label>

                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#1a365d]"
                >
                  <option value="">اختر البراند</option>

                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name_ar}
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
                  required
                  disabled={!formData.brand_id}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#1a365d] disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">اختر عميل البراند</option>

                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* الكولكشن */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  الكولكشن *
                </label>

                <select
                  value={selectedCollectionId}
                  onChange={handleCollectionChange}
                  disabled={!formData.brand_id || collections.length === 0}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#1a365d] disabled:bg-slate-100"
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

              {/* ==================================================
                  أمر التشغيل
              ================================================== */}

              {selectedCollectionId && (
                <div className="md:col-span-2">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                    <div className="mb-5 flex items-center gap-2">
                      <Layers size={20} className="text-[#1a365d]" />

                      <div>
                        <h3 className="font-bold text-[#1a365d]">
                          بيانات أمر التشغيل
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          عدد السريهات يتم قراءته من أمر التشغيل وليس رقمًا
                          ثابتًا.
                        </p>
                      </div>
                    </div>

                    {isLoadingCollection ? (
                      <div className="rounded-xl bg-white p-8 text-center text-sm font-bold text-[#1a365d]">
                        جاري تحميل أمر التشغيل...
                      </div>
                    ) : !productionOrder ? (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
                        <p className="font-bold text-red-700">
                          لا يوجد أمر تشغيل لهذا الكولكشن.
                        </p>

                        <p className="mt-1 text-xs text-red-500">
                          يجب إصدار أمر تشغيل أولًا قبل إنشاء الشحنة.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* رقم أمر التشغيل */}

                        <div className="mb-4 rounded-xl border border-blue-100 bg-white p-4">
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                              <p className="text-xs text-slate-500">
                                رقم أمر التشغيل
                              </p>

                              <p className="mt-1 font-black text-[#1a365d]">
                                {productionOrder.order_number}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-slate-500">
                                إجمالي قطع أمر التشغيل
                              </p>

                              <p className="mt-1 font-black text-[#1a365d]">
                                {productionOrder.total_quantity}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-slate-500">الحالة</p>

                              <p className="mt-1 font-black text-emerald-700">
                                {productionOrder.status}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* الموديلات */}

                        <div className="mb-4 flex items-center justify-between">
                          <label className="text-sm font-bold text-slate-700">
                            موديلات الكولكشن
                          </label>

                          <button
                            type="button"
                            onClick={toggleAllModels}
                            className="text-xs font-bold text-[#1a365d] hover:underline"
                          >
                            {selectedCollectionModels.length ===
                            collectionModels.length
                              ? "إلغاء تحديد الكل"
                              : "تحديد كل الموديلات"}
                          </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {collectionModels.map((model) => {
                            const selected = selectedCollectionModels.includes(
                              model.id,
                            );

                            return (
                              <button
                                key={model.id}
                                type="button"
                                onClick={() => toggleCollectionModel(model.id)}
                                className={`rounded-xl border bg-white p-4 text-right transition ${
                                  selected
                                    ? "border-[#1a365d] ring-1 ring-[#1a365d]"
                                    : "border-slate-200 hover:border-slate-400"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="font-bold text-slate-800">
                                      {model.model_number}
                                      {" — "}
                                      {model.name || "بدون اسم"}
                                    </p>

                                    <p className="mt-2 text-xs text-slate-500">
                                      {model.sizeCount} مقاسات
                                    </p>
                                  </div>

                                  <div
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
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

                                {model.sizes.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-1.5">
                                    {model.sizes.map((size) => (
                                      <span
                                        key={size.name}
                                        className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600"
                                      >
                                        {size.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* ==================================================
                            ملخص السريهات
                        ================================================== */}

                        {selectedModels.length > 0 && (
                          <div className="mt-5">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              {/* الموديلات */}

                              <div className="rounded-xl bg-white p-4 text-center">
                                <p className="text-xs text-slate-500">
                                  الموديلات
                                </p>

                                <p className="mt-1 text-2xl font-black text-[#1a365d]">
                                  {selectedModels.length}
                                </p>
                              </div>

                              {/* المقاسات */}

                              <div className="rounded-xl bg-white p-4 text-center">
                                <p className="text-xs text-slate-500">
                                  المقاسات
                                </p>

                                <p className="mt-1 text-2xl font-black text-[#1a365d]">
                                  {commonSizes.length}
                                </p>
                              </div>

                              {/* السريهات الحقيقية */}

                              {/* السريهات الحقيقية */}
                              <div className="rounded-xl bg-[#1a365d] p-4 text-center text-white">
                                <p className="text-xs text-blue-100">
                                  السريهات المتاحة
                                </p>

                                <p className="mt-1 text-2xl font-black">
                                  {totalSeries}
                                </p>

                                {/* 💡 التعديل هنا: اتغيرت الكلمة للمخزن */}
                                <p className="mt-1 text-[10px] text-blue-100">
                                  جاهزة في المخزن
                                </p>
                              </div>

                              {/* القطع في السري */}

                              <div className="rounded-xl bg-white p-4 text-center">
                                <p className="text-xs text-slate-500">
                                  قطع السري الواحد
                                </p>

                                <p className="mt-1 text-2xl font-black text-[#1a365d]">
                                  {piecesPerSeries}
                                </p>

                                <p className="mt-1 text-[10px] text-slate-400">
                                  موديلات × مقاسات
                                </p>
                              </div>
                            </div>

                            {/* ==================================================
                                إدخال عدد السريهات
                            ================================================== */}

                            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
                              <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                  <label className="mb-2 block text-xs font-bold text-slate-600">
                                    عدد السريهات المراد شحنها *
                                  </label>

                                  <input
                                    type="number"
                                    min="1"
                                    max={totalSeries}
                                    value={seriesToShip}
                                    onChange={(e) => {
                                      setSeriesToShip(e.target.value);

                                      setBrokenItems([]);
                                    }}
                                    placeholder={`من 1 إلى ${totalSeries}`}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg font-black outline-none focus:border-[#1a365d]"
                                  />
                                </div>

                                {/* القطع */}

                                <div className="rounded-xl bg-blue-50 p-4">
                                  <p className="text-xs text-blue-600">
                                    القطع الناتجة عن السريهات
                                  </p>

                                  <p className="mt-1 text-2xl font-black text-[#1a365d]">
                                    {seriesPieces}
                                  </p>

                                  <p className="text-[10px] text-slate-500">
                                    {requestedSeries} × {piecesPerSeries}
                                  </p>
                                </div>

                                {/* المتبقي */}

                                <div className="rounded-xl bg-emerald-50 p-4">
                                  <p className="text-xs text-emerald-600">
                                    السريهات المتبقية
                                  </p>

                                  <p className="mt-1 text-2xl font-black text-emerald-700">
                                    {remainingSeries}
                                  </p>

                                  <p className="text-[10px] text-slate-500">
                                    من أصل {totalSeries}
                                  </p>
                                </div>
                              </div>

                              {/* التوضيح */}

                              {requestedSeries > 0 && (
                                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                                  <div className="flex items-start gap-3">
                                    <Box
                                      size={20}
                                      className="mt-0.5 shrink-0 text-[#1a365d]"
                                    />

                                    <div>
                                      <p className="font-bold text-[#1a365d]">
                                        {requestedSeries} سري = {seriesPieces}{" "}
                                        قطعة
                                      </p>

                                      <p className="mt-1 text-xs leading-6 text-slate-600">
                                        السري الواحد يحتوي على قطعة واحدة من كل
                                        موديل في كل مقاس. وعدد السريهات مأخوذ من
                                        أمر التشغيل.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ==================================================
                  المكسر
              ================================================== */}

              {selectedModels.length > 0 && commonSizes.length > 0 && (
                <div className="md:col-span-2">
                  <div className="rounded-2xl border border-red-100 bg-red-50/40 p-5">
                    <div className="mb-4">
                      <h3 className="font-bold text-red-800">المكسر</h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        أدخل كمية المكسر لكل موديل ولكل مقاس.
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-right text-sm">
                          <thead className="bg-slate-100">
                            <tr>
                              <th className="p-3 font-bold text-slate-600">
                                الموديل
                              </th>

                              {commonSizes.map((size) => (
                                <th
                                  key={size.name}
                                  className="p-3 text-center font-bold text-slate-600"
                                >
                                  {size.name}
                                </th>
                              ))}

                              <th className="p-3 text-center font-bold text-red-700">
                                إجمالي الموديل
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100">
                            {selectedModels.map((model) => {
                              const modelBroken = brokenItems
                                .filter((item) => item.model_id === model.id)
                                .reduce(
                                  (sum, item) =>
                                    sum + Number(item.quantity || 0),
                                  0,
                                );

                              return (
                                <tr key={model.id}>
                                  <td className="p-3">
                                    <p className="font-bold text-slate-800">
                                      {model.model_number}
                                    </p>

                                    <p className="text-xs text-slate-400">
                                      {model.name || "بدون اسم"}
                                    </p>
                                  </td>

                                  {commonSizes.map((size) => (
                                    <td key={size.name} className="p-2">
                                      <input
                                        type="number"
                                        min="0"
                                        value={getBrokenQuantity(
                                          model.id,
                                          size.name,
                                        )}
                                        onChange={(e) =>
                                          updateBrokenQuantity(
                                            model.id,
                                            model.model_number,
                                            model.name,
                                            size.name,
                                            e.target.value,
                                          )
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-center text-sm font-bold outline-none focus:border-red-700 focus:bg-white"
                                      />
                                    </td>
                                  ))}

                                  <td className="p-3 text-center">
                                    <span className="font-black text-red-700">
                                      {modelBroken}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* إجمالي المكسر */}

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs text-slate-500">إجمالي المكسر</p>

                        <p className="mt-1 text-2xl font-black text-red-700">
                          {brokenQty}
                        </p>

                        <p className="text-[10px] text-slate-400">قطعة</p>
                      </div>

                      <div className="rounded-xl bg-[#1a365d] p-4 text-white">
                        <p className="text-xs text-blue-100">المجمع</p>

                        <p className="mt-1 text-2xl font-black">
                          {combinedQty}
                        </p>

                        <p className="text-[10px] text-blue-100">
                          السريهات + المكسر
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================
                  ملخص الشحنة
              ================================================== */}

              {selectedModels.length > 0 && requestedSeries > 0 && (
                <div className="md:col-span-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="mb-4 font-bold text-[#1a365d]">
                      ملخص الشحنة
                    </h3>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs text-slate-500">
                          السريهات المشحونة
                        </p>

                        <p className="mt-1 text-2xl font-black text-[#1a365d]">
                          {requestedSeries}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs text-slate-500">
                          القطع من السريهات
                        </p>

                        <p className="mt-1 text-2xl font-black text-[#1a365d]">
                          {seriesPieces}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs text-slate-500">المكسر</p>

                        <p className="mt-1 text-2xl font-black text-red-700">
                          {brokenQty}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#1a365d] p-4 text-white">
                        <p className="text-xs text-blue-100">إجمالي القطع</p>

                        <p className="mt-1 text-2xl font-black">
                          {combinedQty}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================
                  شركة الشحن
              ================================================== */}

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  شركة الشحن / المندوب
                </label>

                <input
                  type="text"
                  name="shipping_company"
                  value={formData.shipping_company}
                  onChange={handleChange}
                  placeholder="أرامكس، بوسطة، مندوب المصنع..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#1a365d]"
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
                  placeholder="AWB-12345678"
                  dir="ltr"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-left outline-none focus:border-[#1a365d]"
                />
              </div>

              {/* الحالة */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  حالة الشحنة المبدئية
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-[#1a365d] outline-none focus:border-[#1a365d]"
                >
                  <option value="preparing">جاري التجهيز</option>

                  <option value="shipped">خرجت للشحن</option>

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
              className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !selectedCollectionId ||
                !productionOrder ||
                selectedModels.length === 0 ||
                requestedSeries <= 0
              }
              className="rounded-xl bg-red-800 px-8 py-3 font-bold text-white shadow-sm transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
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
