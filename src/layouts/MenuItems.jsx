export const menuItems = {
  customer_service: [
    { title: "الرئيسية", path: "/customer_service" },
    { title: "اضافة براند", path: "/customer_service/add_brand" },
    { title: "البراندات", path: "/customer_service/brands" },
    { title: "كل الكولكشنات", path: "/customer_service/collections" },
    { title: "اعداد كولكشن", path: "/customer_service/add_collection" },
    { title: "الموديلات", path: "/customer_service/models" },
    {
      title: "المساعد الذكي للموديلات",
      path: "/customer_service/models_assistant",
    },
    { title: "متابعة العملاء", path: "/customer_service/customer_followup" },
    { title: "التسعير و عروض الاسعار", path: "/customer_service/pricing" },
  ],

  planning: [
    { title: "الرئيسية", path: "/planning" },
    { title: "الكولكشنات", path: "/planning/collections" },
    { title: "جدول التسليمات", path: "/planning/deliverables_schedule" },
    { title: "المهندس المخطط", path: "/planning/planning_engineer" },
  ],

  warehouse: [
    { title: "الرئيسية", path: "/shipping" },
    { title: "استلام من التخطيط", path: "/shipping/receiving" },
    { title: "المخزون و الجرد", path: "/shipping/inventory" },
    { title: "العملاء", path: "/shipping/customers" },
    { title: "الشحنات", path: "/shipping/shipments" },
    { title: "التقارير", path: "/shipping/reports" },
  ],

  management: [
    { title: "الرئيسية", path: "/managments" },
    { title: "البراندات", path: "/managments/brands" },
    { title: "متابعة الأوردرات", path: "/managments/orders_followup" },
    { title: "سجل التعديلات", path: "/managments/edits_history" },
    { title: "قاعدة المعرفة", path: "/managments/knowledge_base" },
    { title: "التقارير", path: "/managments/reports" },
    { title: "الموافقات", path: "/managments/approvals" },
  ],

  admin: [
    { type: "header", title: "الإدارة العامة" },
    { title: "الرئيسية (الإدارة)", path: "/admin/managments" },
    { title: "الموافقات والاعتمادات", path: "/admin/managments/approvals" },
    { title: "التقارير الشاملة", path: "/admin/managments/reports" },
    { title: "متابعة الأوردرات", path: "/admin/managments/orders_followup" },
    { title: "سجل التعديلات", path: "/admin/managments/edits_history" },
    { title: "قاعدة المعرفة", path: "/admin/managments/knowledge_base" },

    { type: "divider" },

    { type: "header", title: "خدمة العملاء" },
    { title: "الرئيسية (خدمة العملاء)", path: "/admin/customer_service" },
    { title: "البراندات", path: "/admin/customer_service/brands" },
    { title: "كل الكولكشنات", path: "/admin/customer_service/collections" },
    { title: "التسعير وعروض الأسعار", path: "/admin/customer_service/pricing" },
    {
      title: "متابعة العملاء",
      path: "/admin/customer_service/customer_followup",
    },
    {
      title: "الموديلات والمساعد الذكي",
      path: "/admin/customer_service/models_assistant",
    },

    { type: "divider" },

    { type: "header", title: "التخطيط" },
    { title: "الرئيسية (التخطيط)", path: "/admin/planning" },
    { title: "الكولكشنات", path: "/admin/planning/collections" },
    { title: "جدول التسليمات", path: "/admin/planning/deliverables_schedule" },
    { title: "المهندس المخطط", path: "/admin/planning/planning_engineer" },

    { type: "divider" },

    { type: "header", title: "الشحن والمخازن" },
    { title: "الرئيسية (المخازن)", path: "/admin/shipping" },
    { title: "المخزون والجرد", path: "/admin/shipping/inventory" },
    { title: "استلام من التخطيط", path: "/admin/shipping/receiving" },
    { title: "الشحنات", path: "/admin/shipping/shipments" },
    { title: "عملاء الشحن", path: "/admin/shipping/customers" },
  ],
};
