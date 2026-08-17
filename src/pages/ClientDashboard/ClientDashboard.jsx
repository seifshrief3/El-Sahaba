// src/pages/ClientDashboard/ClientDashboard.jsx

import React, { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "../../../supabase";
import { Boxes } from "lucide-react";
import { useReactToPrint } from "react-to-print";

import Header from "./components/Header";
import Navigation from "./components/Navigation";
import DashboardHome from "./components/DashboardHome";
import CollectionsTab from "./components/CollectionsTab";
import ShipmentsTab from "./components/ShipmentsTab";
import CollectionModal from "./modals/CollectionModal";
import ShipmentModal from "./modals/ShipmentModal";

const ClientDashboard = ({ clientId }) => {
  const [activePage, setActivePage] = useState("home");

  const [user, setUser] = useState(null);
  const [brand, setBrand] = useState(null);

  const [collections, setCollections] = useState([]);
  const [models, setModels] = useState([]);
  const [techPacks, setTechPacks] = useState([]);
  const [quotations, setQuotations] = useState([]);

  const [productionOrders, setProductionOrders] = useState([]);
  const [productionOrderItems, setProductionOrderItems] = useState([]);

  // =========================================================
  // PRODUCTION TRACKING
  // =========================================================

  const [productionStages, setProductionStages] = useState([]);
  const [orderTracking, setOrderTracking] = useState([]);

  const [inventory, setInventory] = useState([]);
  const [shipments, setShipments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  // =========================================================
  // PRINT REFS
  // =========================================================

  const shipmentsPrintRef = useRef(null);

  // =========================================================
  // PRINT SHIPMENTS REPORT
  // =========================================================

  const handlePrintShipments = useReactToPrint({
    contentRef: shipmentsPrintRef,
    documentTitle: "تقرير_الشحنات",

    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 10mm;
      }

      @media print {
        html,
        body {
          direction: rtl;
          background: white !important;
          margin: 0 !important;
          padding: 0 !important;
          font-family: Arial, "Tajawal", sans-serif;
        }

        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .print-container {
          width: 100% !important;
          display: block !important;
        }

        .print-hide {
          display: none !important;
        }

        .print-only {
          display: block !important;
        }

        table {
          width: 100% !important;
          border-collapse: collapse !important;
        }

        th,
        td {
          border: 1px solid #cbd5e1 !important;
          padding: 8px !important;
          text-align: center !important;
        }

        th {
          background-color: #0D2748 !important;
          color: white !important;
        }

        tr {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .shadow-sm,
        .shadow-md,
        .shadow-lg,
        .shadow-xl,
        .shadow-2xl {
          box-shadow: none !important;
        }
      }
    `,
  });

  // =========================================================
  // AUTH
  // =========================================================

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      setUser(authUser || null);
    };

    getUser();
  }, []);

  // =========================================================
  // FETCH DASHBOARD
  // =========================================================

  const fetchDashboard = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // -------------------------------------------------------
      // Current Auth User
      // -------------------------------------------------------

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser && !clientId) {
        throw new Error("لم يتم العثور على المستخدم.");
      }

      const currentUserId = authUser?.id;

      // -------------------------------------------------------
      // Brand
      // -------------------------------------------------------

      let brandQuery = supabase.from("brands").select("*");

      if (clientId) {
        brandQuery = brandQuery.eq("id", clientId);
      } else {
        brandQuery = brandQuery.eq("client_portal_user_id", currentUserId);
      }

      const { data: brandData, error: brandError } =
        await brandQuery.maybeSingle();

      if (brandError) {
        console.error("Brand Error:", brandError);
        throw new Error("خطأ في جلب البراند");
      }

      if (!brandData) {
        throw new Error("لم يتم العثور على البراند");
      }

      setBrand(brandData);

      const brandId = brandData.id;

      // =======================================================
      // Collections
      // =======================================================

      const { data: collectionsData, error: collectionsError } = await supabase
        .from("collections")
        .select("*")
        .eq("brand_id", brandId)
        .order("created_at", {
          ascending: false,
        });

      if (collectionsError) {
        console.error("Collections Error:", collectionsError);
      }

      const safeCollections = collectionsData || [];

      setCollections(safeCollections);

      const collectionIds = safeCollections.map((item) => item.id);

      // =======================================================
      // Quotations
      // =======================================================

      let quotationsData = [];

      if (collectionIds.length > 0) {
        const { data, error } = await supabase
          .from("quotations")
          .select(
            `
            id,
            collection_id,
            quotation_number,
            total_sales_price,
            payment_execution_terms,
            notes,
            status,
            created_at,
            updated_at,
            quotation_items (
              id,
              quotation_id,
              model_id,
              company_cost,
              profit_percentage,
              selling_price,
              created_at,
              models (
                id,
                name,
                model_number
              )
            )
          `,
          )
          .in("collection_id", collectionIds)
          .in("status", ["sent", "revised", "approved"])
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          console.error("Error fetching quotations:", error);
        } else {
          quotationsData = data || [];
        }
      }

      setQuotations(quotationsData);

      // =======================================================
      // Production Orders
      // =======================================================

      let ordersData = [];

      if (collectionIds.length > 0) {
        const { data, error } = await supabase
          .from("production_orders")
          .select(
            `
              id,
              collection_id,
              status,
              total_quantity,
              order_number,
              created_at,
              updated_at
            `,
          )
          .in("collection_id", collectionIds);

        if (error) {
          console.error("Production Orders Error:", error);
        }

        ordersData = data || [];
      }

      setProductionOrders(ordersData);

      const orderIds = ordersData.map((order) => order.id);

      // =======================================================
      // PRODUCTION STAGES
      // =======================================================
      //
      // جدول production_stages يحتوي على مراحل الإنتاج
      // وهي مراحل عامة تخص النظام.
      //
      // نستخدم select("*") حتى لا نفترض أسماء الأعمدة.
      //
      // =======================================================

      let productionStagesData = [];

      const { data: stagesData, error: stagesError } = await supabase
        .from("production_stages")
        .select("*");

      if (stagesError) {
        console.error("Production Stages Error:", stagesError);
      } else {
        productionStagesData = stagesData || [];
      }

      // ترتيب المراحل لو كان جدولك يحتوي على أي من
      // الأعمدة الشائعة للترتيب.
      productionStagesData.sort((a, b) => {
        const orderA = Number(
          a.stage_order ??
            a.order_index ??
            a.sort_order ??
            a.position ??
            a.sequence ??
            9999,
        );

        const orderB = Number(
          b.stage_order ??
            b.order_index ??
            b.sort_order ??
            b.position ??
            b.sequence ??
            9999,
        );

        return orderA - orderB;
      });

      setProductionStages(productionStagesData);

      // =======================================================
      // ORDER TRACKING
      // =======================================================
      //
      // كل Tracking مرتبط بأمر إنتاج.
      //
      // نفترض أن عمود الربط هو:
      // production_order_id
      //
      // ونستخدم select("*") حتى نأخذ كل بيانات التتبع.
      //
      // =======================================================

      let orderTrackingData = [];

      if (orderIds.length > 0) {
        const { data: trackingData, error: trackingError } = await supabase
          .from("order_tracking")
          .select("*")
          .in("production_order_id", orderIds);

        if (trackingError) {
          console.error("Order Tracking Error:", trackingError);
        } else {
          orderTrackingData = trackingData || [];
        }
      }

      setOrderTracking(orderTrackingData);

      // =======================================================
      // Models
      // =======================================================

      let modelsData = [];

      if (collectionIds.length > 0) {
        const { data, error } = await supabase
          .from("models")
          .select("*")
          .in("collection_id", collectionIds);

        if (error) {
          console.error("Models Error:", error);
        }

        modelsData = data || [];
      }

      setModels(modelsData);

      const modelIds = modelsData.map((model) => model.id);

      // =======================================================
      // Tech Packs
      // =======================================================

      let techPacksData = [];

      if (modelIds.length > 0) {
        const { data, error } = await supabase
          .from("tech_packs")
          .select(
            `
            id,
            model_id,
            content,
            status,
            version,
            file_url,
            created_at
          `,
          )
          .in("model_id", modelIds)
          .order("version", {
            ascending: false,
          })
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          console.error("Tech Packs Error:", error);
        } else {
          techPacksData = data || [];
        }
      }

      setTechPacks(techPacksData);

      // =======================================================
      // Production Order Items
      // =======================================================

      let orderItemsData = [];

      if (orderIds.length > 0) {
        const { data, error } = await supabase
          .from("production_order_items")
          .select(
            `
              id,
              production_order_id,
              model_id,
              variant_key,
              selling_price,
              total_quantity,
              part,
              color,
              size,
              quantity
            `,
          )
          .in("production_order_id", orderIds);

        if (error) {
          console.error("Production Order Items Error:", error);
        }

        orderItemsData = data || [];
      }

      setProductionOrderItems(orderItemsData);

      // =======================================================
      // Inventory
      // =======================================================

      let inventoryData = [];

      if (modelIds.length > 0) {
        const { data, error } = await supabase
          .from("inventory")
          .select(
            `
              model_id,
              available_qty,
              shipped_qty,
              reserved_qty,
              received_qty,
              size,
              color,
              last_updated,
              models (
                name,
                model_number,
                image_url
              )
            `,
          )
          .in("model_id", modelIds);

        if (error) {
          console.error("Inventory Error:", error);
        }

        inventoryData = data || [];
      }

      setInventory(inventoryData);

      // =======================================================
      // Shipments
      // =======================================================

      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from("shipments")
        .select(
          `
            id,
            shipment_number,
            status,
            created_at,
            tracking_number,
            shipping_company,
            customers (
              name,
              phone
            ),
            shipment_items (
              quantity,
              inventory (
                size,
                color,
                models (
                  name,
                  model_number,
                  image_url
                )
              )
            )
          `,
        )
        .eq("brand_id", brandId)
        .order("created_at", {
          ascending: false,
        });

      if (shipmentsError) {
        console.error("Shipments Error:", shipmentsError);
      }

      setShipments(shipmentsData || []);
    } catch (error) {
      console.error("Client Dashboard Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    if (user || clientId) {
      fetchDashboard();
    }
  }, [user, clientId]);

  // =========================================================
  // INVENTORY SUMMARY
  // =========================================================

  const inventorySummary = useMemo(() => {
    return inventory.reduce(
      (acc, item) => {
        acc.available += Number(item.available_qty) || 0;

        acc.shipped += Number(item.shipped_qty) || 0;

        acc.reserved += Number(item.reserved_qty) || 0;

        acc.received += Number(item.received_qty) || 0;

        return acc;
      },
      {
        available: 0,
        shipped: 0,
        reserved: 0,
        received: 0,
      },
    );
  }, [inventory]);

  // =========================================================
  // TOTAL PRODUCTION QUANTITY
  // =========================================================

  const totalProductionQuantity = useMemo(() => {
    return productionOrders.reduce(
      (sum, order) => sum + (Number(order.total_quantity) || 0),
      0,
    );
  }, [productionOrders]);

  // =========================================================
  // SHIPMENT ROWS
  // =========================================================

  const shipmentRows = useMemo(() => {
    return shipments.map((shipment) => {
      const quantity = (shipment.shipment_items || []).reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0,
      );

      return {
        ...shipment,
        totalQuantity: quantity,
      };
    });
  }, [shipments]);

  // =========================================================
  // ENRICHED COLLECTIONS
  // =========================================================

  const enrichedCollections = useMemo(() => {
    return collections.map((collection) => {
      // -----------------------------------------------------
      // Order
      // -----------------------------------------------------

      const order = productionOrders.find(
        (item) => item.collection_id === collection.id,
      );

      // -----------------------------------------------------
      // Order Tracking
      // -----------------------------------------------------

      const collectionOrderTracking = order
        ? orderTracking.filter(
            (tracking) => tracking.production_order_id === order.id,
          )
        : [];

      // -----------------------------------------------------
      // Models
      // -----------------------------------------------------

      const collectionModels = models.filter(
        (model) => model.collection_id === collection.id,
      );

      // -----------------------------------------------------
      // Order Items
      // -----------------------------------------------------

      const orderItems = productionOrderItems.filter(
        (item) => item.production_order_id === order?.id,
      );

      const totalQuantity = Number(order?.total_quantity) || 0;

      // -----------------------------------------------------
      // Model IDs
      // -----------------------------------------------------

      const collectionModelIds = collectionModels.map((model) => model.id);

      // -----------------------------------------------------
      // Inventory
      // -----------------------------------------------------

      const collectionInventory = inventory.filter((item) =>
        collectionModelIds.includes(item.model_id),
      );

      // -----------------------------------------------------
      // Tech Packs
      // -----------------------------------------------------

      const collectionTechPacks = techPacks.filter((techPack) =>
        collectionModelIds.includes(techPack.model_id),
      );

      // أحدث Tech Pack لكل موديل
      const latestTechPacksByModel = {};

      collectionTechPacks.forEach((techPack) => {
        const existing = latestTechPacksByModel[techPack.model_id];

        if (
          !existing ||
          Number(techPack.version || 0) > Number(existing.version || 0)
        ) {
          latestTechPacksByModel[techPack.model_id] = techPack;
        }
      });

      // -----------------------------------------------------
      // Quotation
      // -----------------------------------------------------

      const collectionQuotations = quotations.filter(
        (quotation) => quotation.collection_id === collection.id,
      );

      const quotation = collectionQuotations[0] || null;

      // -----------------------------------------------------
      // Inventory Calculations
      // -----------------------------------------------------

      const availableQuantity = collectionInventory.reduce(
        (sum, item) => sum + (Number(item.available_qty) || 0),
        0,
      );

      const shippedQuantity = collectionInventory.reduce(
        (sum, item) => sum + (Number(item.shipped_qty) || 0),
        0,
      );

      const receivedQuantity = collectionInventory.reduce(
        (sum, item) => sum + (Number(item.received_qty) || 0),
        0,
      );

      const reservedQuantity = collectionInventory.reduce(
        (sum, item) => sum + (Number(item.reserved_qty) || 0),
        0,
      );

      // -----------------------------------------------------
      // Return
      // -----------------------------------------------------

      return {
        ...collection,

        order,

        models: collectionModels,

        orderItems,

        totalQuantity,

        availableQuantity,

        shippedQuantity,

        receivedQuantity,

        reservedQuantity,

        techPacks: latestTechPacksByModel,

        quotation,

        // Production Tracking
        orderTracking: collectionOrderTracking,

        productionStages,
      };
    });
  }, [
    collections,
    productionOrders,
    models,
    productionOrderItems,
    inventory,
    techPacks,
    quotations,
    orderTracking,
    productionStages,
  ]);

  // =========================================================
  // FILTERED COLLECTIONS
  // =========================================================

  const filteredCollections = useMemo(() => {
    if (!searchTerm.trim()) {
      return enrichedCollections;
    }

    const search = searchTerm.trim().toLowerCase();

    return enrichedCollections.filter((collection) => {
      const collectionName = String(collection.name || "").toLowerCase();

      const modelMatch = collection.models.some((model) =>
        String(model.name || "")
          .toLowerCase()
          .includes(search),
      );

      return collectionName.includes(search) || modelMatch;
    });
  }, [enrichedCollections, searchTerm]);

  // =========================================================
  // INVENTORY ROWS
  // =========================================================

  const inventoryRows = useMemo(() => {
    const grouped = {};

    inventory.forEach((item) => {
      const modelId = item.model_id;

      if (!grouped[modelId]) {
        grouped[modelId] = {
          modelId,
          model: item.models,
          available: 0,
          shipped: 0,
          reserved: 0,
          received: 0,
          sizes: {},
        };
      }

      grouped[modelId].available += Number(item.available_qty) || 0;

      grouped[modelId].shipped += Number(item.shipped_qty) || 0;

      grouped[modelId].reserved += Number(item.reserved_qty) || 0;

      grouped[modelId].received += Number(item.received_qty) || 0;

      const sizeName = item.size || "غير محدد";

      if (!grouped[modelId].sizes[sizeName]) {
        grouped[modelId].sizes[sizeName] = 0;
      }

      grouped[modelId].sizes[sizeName] += Number(item.available_qty) || 0;
    });

    return Object.values(grouped);
  }, [inventory]);

  // =========================================================
  // SIZE COLUMNS
  // =========================================================

  const sizeColumns = useMemo(() => {
    const preferred = ["10", "12", "14", "16", "18"];

    const availableSizes = new Set();

    inventory.forEach((item) => {
      if (item.size) {
        availableSizes.add(String(item.size));
      }
    });

    const sorted = Array.from(availableSizes);

    const preferredExisting = preferred.filter((size) =>
      availableSizes.has(size),
    );

    const rest = sorted.filter((size) => !preferred.includes(size));

    return [...preferredExisting, ...rest].slice(0, 5);
  }, [inventory]);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    await supabase.auth.signOut();

    window.location.href = "/login";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#F3F5F8] flex items-center justify-center"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0D2748] text-white flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Boxes size={30} />
          </div>

          <p className="font-black text-[#102A43]">
            جاري تحميل بيانات لوحة العميل...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F3F5F8] text-[#102A43] print:bg-white print:min-h-fit"
    >
      {/* =====================================================
          Header
      ===================================================== */}

      <Header
        brand={brand}
        refreshing={refreshing}
        onRefresh={() => fetchDashboard(true)}
        onLogout={handleLogout}
      />

      {/* =====================================================
          Navigation
      ===================================================== */}

      <Navigation activePage={activePage} setActivePage={setActivePage} />

      <main className="max-w-[1600px] mx-auto px-3 md:px-7 py-5 md:py-7">
        {/* ===================================================
            Home
        =================================================== */}

        {activePage === "home" && (
          <DashboardHome
            totalShipped={inventorySummary.shipped}
            totalProductionQuantity={totalProductionQuantity}
            inventorySummary={inventorySummary}
            inventoryRows={inventoryRows}
            sizeColumns={sizeColumns}
            shipmentRows={shipmentRows}
            shipmentCount={shipments.length}
            completedShipments={
              shipments.filter(
                (s) => s.status === "shipped" || s.status === "delivered",
              ).length
            }
            pendingShipments={
              shipments.filter(
                (s) =>
                  s.status === "pending" || s.status === "partially_shipped",
              ).length
            }
            enrichedCollections={enrichedCollections}
            inventory={inventory}
            // =================================================
            // PRODUCTION TRACKING
            // =================================================

            productionStages={productionStages}
            orderTracking={orderTracking}
            productionOrders={productionOrders}
            setActivePage={setActivePage}
            setSelectedShipment={setSelectedShipment}
          />
        )}

        {/* ===================================================
            Collections
        =================================================== */}

        {activePage === "collections" && (
          <CollectionsTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredCollections={filteredCollections}
            setSelectedCollection={setSelectedCollection}
          />
        )}

        {/* ===================================================
            Shipments
        =================================================== */}

        {activePage === "shipments" && (
          <ShipmentsTab
            shipmentRows={shipmentRows}
            shipmentCount={shipments.length}
            completedShipments={
              shipments.filter(
                (s) => s.status === "shipped" || s.status === "delivered",
              ).length
            }
            pendingShipments={
              shipments.filter(
                (s) =>
                  s.status === "pending" || s.status === "partially_shipped",
              ).length
            }
            totalShipped={inventorySummary.shipped}
            setSelectedShipment={setSelectedShipment}
            handlePrintShipments={handlePrintShipments}
            shipmentsPrintRef={shipmentsPrintRef}
          />
        )}
      </main>

      {/* =====================================================
          Collection Modal
      ===================================================== */}

      {selectedCollection && (
        <CollectionModal
          collection={selectedCollection}
          onClose={() => setSelectedCollection(null)}
          inventory={inventory}
          techPacks={Object.values(selectedCollection.techPacks || {})}
          quotation={selectedCollection.quotation || null}
          quotationItems={selectedCollection.quotation?.quotation_items || []}
        />
      )}

      {/* =====================================================
          Shipment Modal
      ===================================================== */}

      <ShipmentModal
        shipment={selectedShipment}
        onClose={() => setSelectedShipment(null)}
      />
    </div>
  );
};

export default ClientDashboard;
