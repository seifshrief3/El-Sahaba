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

  // 7. جلب بيانات הـ PDF (الصور والخامات من الـ JSON المربوط بالموديلات)
  fetchQuotationDetailsForPDF: async (collectionId) => {
    try {
      const { data: modelsData, error } = await supabase
        .from("models")
        .select(`
          model_number,
          image_url,
          tech_packs ( content ) 
        `)
        .eq("collection_id", collectionId);

      if (error) throw error;

      let specs = {
        category: "أولادي",
        main_fabric: "ميلتون مكستر",
        fabric_weight: "330 جرام",
        sizes: "6 / 8 / 10 / 12 / 14"
      };

      if (modelsData && modelsData.length > 0) {
        const firstTechPack = modelsData[0].tech_packs;
        const techPackContent = Array.isArray(firstTechPack)
          ? firstTechPack[0]?.content
          : firstTechPack?.content;

        if (techPackContent) {
          const info = techPackContent.basic_info || techPackContent;

          if (info.category && info.category !== '-') specs.category = info.category;
          else if (info.target_audience && info.target_audience !== '-') specs.category = info.target_audience;

          if (info.main_fabric && info.main_fabric !== '-') specs.main_fabric = info.main_fabric;
          else if (info.fabric_type && info.fabric_type !== '-') specs.main_fabric = info.fabric_type;
          else if (info.material && info.material !== '-') specs.main_fabric = info.material;

          if (info.fabric_weight && info.fabric_weight !== '-') specs.fabric_weight = info.fabric_weight;
          else if (info.weight && info.weight !== '-') specs.fabric_weight = info.weight;

          if (info.size_range && info.size_range !== '-') specs.sizes = info.size_range;
          else if (info.sizes && info.sizes !== '-') specs.sizes = info.sizes;
        }
      }

      const defaultImage = "https://placehold.co/400x600/f8fafc/1e293b?text=صورة+الموديل";

      return {
        models: modelsData.map(m => ({
          model_number: m.model_number,
          image_url: m.image_url ? m.image_url : defaultImage
        })),
        ...specs
      };
    } catch (err) {
      console.error("Error fetching details for PDF:", err);
      return { models: [], category: "-", main_fabric: "-", fabric_weight: "-", sizes: "-" };
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

};