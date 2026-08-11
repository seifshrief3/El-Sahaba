import { supabase } from "../../supabase";
import { addSystemLog } from "./systemLogService"; // 💡 تأكد من مسار ملف الـ Logs

const getArabicStatus = (status) => {
  const statusMap = {
    'draft': "مسودة",
    'sent': "بانتظار رد العميل",
    'revision_requested': "مرفوض / يحتاج تعديل",
    'revised': "تم التعديل",
    'approved': "تم الاعتماد",
    'rejected': "مرفوض نهائياً"
  };
  return statusMap[status] || status;
};

export const pricingService = {
  // 1. جلب الكولكشنات مع اسم البراند وحالة التسعير
  fetchCollections: async () => {
    try {
      const { data, error } = await supabase
        .from("collections")
        .select(`
          id, 
          name, 
          created_at,
          brands ( name_ar ),
          quotations ( id )
        `);

      if (error) throw error;

      return data.map(col => ({
        id: col.id,
        name: col.name,
        brand_name: col.brands?.name_ar || "براند غير محدد",
        created_at: col.created_at,
        is_priced: col.quotations && col.quotations.length > 0
      }));
    } catch (err) {
      console.error("Error fetching collections:", err);
      return [];
    }
  },

  // 2. جلب الموديلات الخاصة بكولكشن معين للتسعير
  fetchModelsByCollection: async (collectionId) => {
    try {
      const { data, error } = await supabase
        .from("models")
        .select("id, name, model_number")
        .eq("collection_id", collectionId);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error fetching models:", err);
      return [];
    }
  },

  // 3. إنشاء عرض السعر
  createQuotation: async (quotationData, itemsData) => {
    try {
      const quoteNumber = `QT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      const quotationPayload = {
        collection_id: quotationData.collection_id,
        quotation_number: quoteNumber,
        total_cost: quotationData.total_cost,
        total_sales_price: quotationData.total_sales_price,
        payment_execution_terms: quotationData.payment_execution_terms,
        notes: quotationData.notes,
        status: "draft",
      };

      const { data: quoteData, error: quoteError } = await supabase
        .from("quotations")
        .insert([quotationPayload])
        .select();

      if (quoteError) throw quoteError;
      const newQuotationId = quoteData[0].id;

      const itemsPayload = itemsData.map(item => ({
        quotation_id: newQuotationId,
        model_id: item.model_id,
        company_cost: item.company_cost,
        profit_percentage: item.profit_percentage,
        selling_price: item.selling_price
      }));

      const { error: itemsError } = await supabase
        .from("quotation_items")
        .insert(itemsPayload);

      if (itemsError) {
        await supabase.from("quotations").delete().eq("id", newQuotationId);
        throw itemsError;
      }

      // 💡 تسجيل حدث إنشاء عرض السعر
      await addSystemLog({
        module: "customer_service",
        action_type: "CREATE",
        entity_type: "quotation",
        entity_id: newQuotationId,
        title: "إنشاء عرض سعر",
        description: `تم إنشاء وتسجيل عرض سعر جديد برقم (${quoteNumber}).`,
        details: {
          quotation_number: quoteNumber,
          total_sales_price: quotationData.total_sales_price,
          collection_id: quotationData.collection_id
        }
      });

      return quoteData[0];
    } catch (err) {
      console.error("Error creating quotation:", err);
      throw err;
    }
  },

  fetchQuotations: async () => {
    try {
      const { data, error } = await supabase
        .from("quotations")
        .select(`
          id,
          quotation_number,
          collection_id,
          total_cost,
          total_sales_price,
          status,
          created_at,
          collections (
            name,
            expected_quantity,
            brands ( name_ar )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map(quote => ({
        id: quote.quotation_number,
        real_id: quote.id,
        collection_id: quote.collection_id,
        brand: quote.collections?.brands?.name_ar || "غير محدد",
        collection: quote.collections?.name || "غير محدد",
        expected_quantity: quote.collections?.expected_quantity || "يحدد لاحقاً",
        date: new Date(quote.created_at).toLocaleDateString("ar-EG", { year: 'numeric', month: 'long', day: 'numeric' }),
        totalCost: quote.total_cost,
        finalPrice: quote.total_sales_price,
        profitMargin: Math.round(((quote.total_sales_price - quote.total_cost) / quote.total_cost) * 100) || 0,
        status: getArabicStatus(quote.status),
      }));

    } catch (err) {
      console.error("Error fetching quotations:", err);
      return [];
    }
  },

  // 5. جلب تفاصيل عرض السعر الخاص بكولكشن معين (للتعديل)
  fetchQuotationByCollection: async (collectionId) => {
    try {
      const { data, error } = await supabase
        .from("quotations")
        .select(`
          *,
          quotation_items (
            model_id,
            company_cost,
            profit_percentage,
            selling_price
          )
        `)
        .eq("collection_id", collectionId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (err) {
      console.error("Error fetching quotation details:", err);
      return null;
    }
  },

  // 6. تحديث عرض سعر موجود بالفعل
  updateQuotation: async (quotationId, quotationData, itemsData) => {
    try {
      const { error: quoteError } = await supabase
        .from("quotations")
        .update({
          total_cost: quotationData.total_cost,
          total_sales_price: quotationData.total_sales_price,
          payment_execution_terms: quotationData.payment_execution_terms,
          notes: quotationData.notes,
        })
        .eq("id", quotationId);
      if (quoteError) throw quoteError;

      const itemsPayload = itemsData.map(item => ({
        quotation_id: quotationId,
        model_id: item.model_id,
        company_cost: item.company_cost,
        profit_percentage: item.profit_percentage,
        selling_price: item.selling_price
      }));

      const { error: itemsError } = await supabase
        .from("quotation_items")
        .upsert(itemsPayload, { onConflict: 'quotation_id, model_id' });
      if (itemsError) throw itemsError;

      // 💡 تسجيل حدث تعديل عرض السعر
      await addSystemLog({
        module: "customer_service",
        action_type: "UPDATE",
        entity_type: "quotation",
        entity_id: quotationId,
        title: "تعديل عرض سعر",
        description: `تم تحديث أسعار وتفاصيل عرض السعر.`,
        details: { total_sales_price: quotationData.total_sales_price }
      });

      return true;
    } catch (err) {
      console.error("Error updating quotation:", err);
      throw err;
    }
  },

  fetchQuotationDetailsForPDF: async (collectionId) => {
    try {
      // ============================================
      // 1. جلب الموديلات وبيانات الـ Tech Pack والبراند
      // ============================================

      const { data: modelsData, error: modelsError } = await supabase
        .from("models")
        .select(`
        model_number,
        image_url,
        tech_packs (
          content
        ),
        collections (
          department,
          brands (
            name_ar,
            logo_url
          )
        )
      `)
        .eq("collection_id", collectionId);

      if (modelsError) throw modelsError;

      // ============================================
      // 2. جلب عرض السعر وعناصره
      // ============================================

      const { data: quotationData, error: quotationError } = await supabase
        .from("quotations")
        .select(`
        id,
        total_sales_price,
        quotation_items (
          model_id,
          selling_price
        )
      `)
        .eq("collection_id", collectionId)
        .single();

      if (quotationError && quotationError.code !== "PGRST116") {
        throw quotationError;
      }

      // ============================================
      // 3. حساب متوسط سعر الموديلات
      // ============================================

      const quotationItems = quotationData?.quotation_items || [];

      const validPrices = quotationItems
        .map((item) => Number(item.selling_price))
        .filter((price) => Number.isFinite(price));

      let averagePrice = 0;

      if (validPrices.length > 0) {
        const totalPrices = validPrices.reduce(
          (sum, price) => sum + price,
          0
        );

        averagePrice = totalPrices / validPrices.length;
      }

      // ============================================
      // 4. البيانات الأساسية للـ PDF
      // ============================================

      let specs = {
        category: "أولادي",
        department: "غير محدد",
        main_fabric: "ميلتون مكستر",
        fabric_weight: "330 جرام",
        sizes: [],
      };

      const allSizes = [];

      // ============================================
      // 5. استخراج بيانات البراند
      // ============================================

      let brandName = "---";
      let brandLogo = null;

      if (modelsData && modelsData.length > 0) {
        const collectionRelation =
          modelsData[0].collections || modelsData[0].collection;

        const brandRelation = collectionRelation?.brands;

        if (brandRelation) {
          brandName = brandRelation.name_ar || "---";
          brandLogo = brandRelation.logo_url || null;
        }
      }

      // ============================================
      // 6. قراءة بيانات الموديلات
      // ============================================

      if (modelsData && modelsData.length > 0) {
        // ============================================
        // Department من الـ Collection
        // ============================================

        const collectionRelation =
          modelsData[0].collections || modelsData[0].collection;

        const collectionDept = collectionRelation?.department;

        if (collectionDept) {
          specs.department = collectionDept;
        }

        // ============================================
        // المرور على الموديلات
        // ============================================

        modelsData.forEach((model) => {
          const techPack = model.tech_packs;

          const techPackContent = Array.isArray(techPack)
            ? techPack[0]?.content
            : techPack?.content;

          if (!techPackContent) return;

          const info =
            techPackContent.basic_info || techPackContent;

          // ============================================
          // Category
          // ============================================

          if (
            specs.category === "أولادي" &&
            info.category &&
            info.category !== "-"
          ) {
            specs.category = info.category;
          } else if (
            specs.category === "أولادي" &&
            info.target_audience &&
            info.target_audience !== "-"
          ) {
            specs.category = info.target_audience;
          }

          // ============================================
          // Fabric
          // ============================================

          if (
            specs.main_fabric === "ميلتون مكستر" &&
            info.main_fabric &&
            info.main_fabric !== "-"
          ) {
            specs.main_fabric = info.main_fabric;
          } else if (
            specs.main_fabric === "ميلتون مكستر" &&
            info.fabric_type &&
            info.fabric_type !== "-"
          ) {
            specs.main_fabric = info.fabric_type;
          } else if (
            specs.main_fabric === "ميلتون مكستر" &&
            info.material &&
            info.material !== "-"
          ) {
            specs.main_fabric = info.material;
          }

          // ============================================
          // Fabric Weight
          // ============================================

          if (
            specs.fabric_weight === "330 جرام" &&
            info.fabric_weight &&
            info.fabric_weight !== "-"
          ) {
            specs.fabric_weight = info.fabric_weight;
          } else if (
            specs.fabric_weight === "330 جرام" &&
            info.weight &&
            info.weight !== "-"
          ) {
            specs.fabric_weight = info.weight;
          }

          // ============================================
          // Sizes
          // ============================================

          let modelSizes = [];

          if (
            info.size_range &&
            info.size_range !== "-"
          ) {
            modelSizes = info.size_range;
          } else if (
            info.sizes &&
            info.sizes !== "-"
          ) {
            modelSizes = info.sizes;
          }

          // لو المقاسات Array
          if (Array.isArray(modelSizes)) {
            modelSizes.forEach((size) => {
              if (size && String(size).trim() !== "-") {
                allSizes.push(String(size).trim());
              }
            });
          }

          // لو المقاسات String
          else if (typeof modelSizes === "string") {
            modelSizes
              .split(/[,،/|]+/)
              .map((size) => size.trim())
              .filter((size) => size && size !== "-")
              .forEach((size) => {
                allSizes.push(size);
              });
          }
        });
      }

      // ============================================
      // 7. إزالة المقاسات المكررة
      // ============================================

      specs.sizes = [...new Set(allSizes)];

      if (specs.sizes.length === 0) {
        specs.sizes = ["غير محدد"];
      }

      // ============================================
      // 8. الصور
      // ============================================

      const defaultImage =
        "https://placehold.co/400x600/f8fafc/1e293b?text=صورة+الموديل";

      // ============================================
      // 9. البيانات النهائية للـ PDF
      // ============================================

      return {
        models: (modelsData || []).map((m) => ({
          model_number: m.model_number,
          image_url: m.image_url
            ? m.image_url
            : defaultImage,
        })),

        ...specs,

        // ============================================
        // بيانات البراند
        // ============================================

        brand: brandName,
        brand_logo: brandLogo,

        // ============================================
        // المقاسات
        // ============================================

        sizes: specs.sizes.join(" / "),

        // ============================================
        // السعر المعروض في الـ PDF
        // متوسط أسعار الموديلات
        // ============================================

        finalPrice: averagePrice,

        // السعر الإجمالي الأصلي
        totalPrice: Number(
          quotationData?.total_sales_price || 0
        ),

        // عدد الموديلات التي دخلت في حساب المتوسط
        modelsCount: validPrices.length,
      };
    } catch (err) {
      console.error(
        "Error fetching details for PDF:",
        err
      );

      return {
        models: [],
        category: "-",
        department: "-",
        main_fabric: "-",
        fabric_weight: "-",
        sizes: "-",

        // بيانات البراند
        brand: "---",
        brand_logo: null,

        // بيانات السعر
        finalPrice: 0,
        totalPrice: 0,
        modelsCount: 0,
      };
    }
  },

  // 8. تحديث حالة عرض السعر
  updateQuotationStatus: async (quotationRealId, newStatus) => {
    try {
      const { error } = await supabase
        .from("quotations")
        .update({ status: newStatus })
        .eq("id", quotationRealId);

      if (error) throw error;

      // 💡 تسجيل حدث تحديث حالة عرض السعر
      await addSystemLog({
        module: "customer_service",
        action_type: "STATUS_CHANGE",
        entity_type: "quotation",
        entity_id: quotationRealId,
        title: "تحديث حالة عرض السعر",
        description: `تم تغيير حالة عرض السعر إلى: ${getArabicStatus(newStatus)}.`,
        details: { new_status: newStatus }
      });

      return true;
    } catch (err) {
      console.error("Error updating quotation status:", err);
      throw err;
    }
  },

  // ... باقي الدوال اللي فوق ...

  // 9. 💡 دالة حذف عرض السعر بالكامل
  deleteQuotation: async (quotationId) => {
    try {
      // 1. مسح العناصر المرتبطة (quotation_items) الأول عشان نتجنب خطأ الـ Foreign Key
      const { error: itemsError } = await supabase
        .from("quotation_items")
        .delete()
        .eq("quotation_id", quotationId);

      if (itemsError) throw itemsError;

      // 2. مسح عرض السعر الأساسي (quotation)
      const { error: quoteError } = await supabase
        .from("quotations")
        .delete()
        .eq("id", quotationId);

      if (quoteError) throw quoteError;

      // 3. 💡 تسجيل حدث الحذف في الـ Logs
      await addSystemLog({
        module: "customer_service",
        action_type: "DELETE",
        entity_type: "quotation",
        entity_id: quotationId,
        title: "حذف عرض سعر",
        description: "تم حذف عرض السعر وجميع العناصر المرتبطة به.",
      });

      return true;
    } catch (err) {
      console.error("Error deleting quotation:", err);
      throw err;
    }
  },

};