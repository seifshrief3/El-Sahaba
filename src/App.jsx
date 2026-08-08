import { Route, Routes } from "react-router-dom";

// =========================
// Auth
// =========================
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// =========================
// Layout
// =========================
import DashboardLayout from "./layouts/DashboardLayout";

// =========================
// Customer Service
// =========================
import CustomerServiceHome from "./pages/customer_service/Home";
import ModelsAssistant from "./pages/customer_service/ModelsAssistant";
import CustomerFollowup from "./pages/customer_service/CustomerFollowup";
import StartOrder from "./pages/customer_service/StartOrder";
import AllBrands from "./pages/customer_service/AllBrands";

// =========================
// Customer Service Features
// =========================
import Brands from "./features/brands/Brands";
import EditBrands from "./features/brands/EditBrands";

import AllCollections from "./features/collections/AllCollections";
import AddCollection from "./features/collections/AddCollection";
import EditCollection from "./features/collections/EditCollection";

import Models from "./features/models/Models";

import Pricing from "./features/pricing/Pricing";
import Quotations from "./features/pricing/Quotations";

// =========================
// Planning
// =========================
import PlanningHome from "./pages/planning/Home";
import DeliverablesSchedule from "./pages/planning/DeliverablesSchedule";
import PlanningEngineer from "./pages/planning/PlanningEngineer";
import CollectionsFromCS from "./pages/planning/CollectionsFromCS";
import Checklist from "./pages/planning/Checklist";

// =========================
// Shipping
// =========================
import ShippingHome from "./pages/shippingAndBarren/Home";
import ReceivingFromPlanning from "./pages/shippingAndBarren/ReceivingFromPlanning";
import Inventory from "./pages/shippingAndBarren/Inventory";
import Customers from "./pages/shippingAndBarren/Customers";
import Shipments from "./pages/shippingAndBarren/Shipments";
import ShippingReports from "./pages/shippingAndBarren/ShippingReports";

// =========================
// Management
// =========================
import Dashboard from "./pages/managments/Dashboard";
import EditsHistory from "./pages/managments/EditsHistory";
import KnowledgeBase from "./pages/managments/KnowledgeBase";
import Reports from "./pages/managments/Reports";
import OrdersFollowup from "./pages/managments/OrdersFollowup";
import Approvals from "./pages/managments/Approvals";

import ClientDashboard from "./pages/ClientDashboard";

function App() {
  return (
    <Routes>
      {/* =========================
          Public Routes
      ========================= */}

      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* =========================
          Admin Routes (مسارات الـ Admin المميزة تبدأ بـ /admin/)
      ========================= */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        {/* Management & Home */}
        <Route
          path="/admin/managments"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/managments/brands"
          element={
            <DashboardLayout>
              <Brands />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/managments/edit_brands/:id"
          element={
            <DashboardLayout>
              <EditBrands />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/managments/edit_collection/:id"
          element={
            <DashboardLayout>
              <EditCollection />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/managments/orders_followup"
          element={
            <DashboardLayout>
              <OrdersFollowup />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/managments/edits_history"
          element={
            <DashboardLayout>
              <EditsHistory />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/managments/knowledge_base"
          element={
            <DashboardLayout>
              <KnowledgeBase />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/managments/reports"
          element={
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/managments/approvals"
          element={
            <DashboardLayout>
              <Approvals />
            </DashboardLayout>
          }
        />

        {/* Customer Service */}
        <Route
          path="/admin/customer_service"
          element={
            <DashboardLayout>
              <CustomerServiceHome />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/customer_service/add_brand"
          element={
            <DashboardLayout>
              <Brands />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/customer_service/brands"
          element={
            <DashboardLayout>
              <AllBrands />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/customer_service/edit_brands/:id"
          element={
            <DashboardLayout>
              <EditBrands />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/customer_service/collections"
          element={
            <DashboardLayout>
              <AllCollections />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/customer_service/add_collection"
          element={
            <DashboardLayout>
              <AddCollection />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/customer_service/models"
          element={
            <DashboardLayout>
              <Models />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/customer_service/edit_collection/:id"
          element={
            <DashboardLayout>
              <EditCollection />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/customer_service/customer_followup"
          element={
            <DashboardLayout>
              <CustomerFollowup />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/customer_service/models_assistant"
          element={
            <DashboardLayout>
              <ModelsAssistant />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/customer_service/pricing"
          element={
            <DashboardLayout>
              <Pricing />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/customer_service/quotations"
          element={
            <DashboardLayout>
              <Quotations />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/customer_service/start_order/:id"
          element={
            <DashboardLayout>
              <StartOrder />
            </DashboardLayout>
          }
        />

        {/* Planning */}
        <Route
          path="/admin/planning"
          element={
            <DashboardLayout>
              <PlanningHome />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/planning/collections"
          element={
            <DashboardLayout>
              <CollectionsFromCS />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/planning/checklist/:id"
          element={
            <DashboardLayout>
              <Checklist />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/planning/deliverables_schedule"
          element={
            <DashboardLayout>
              <DeliverablesSchedule />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/planning/planning_engineer"
          element={
            <DashboardLayout>
              <PlanningEngineer />
            </DashboardLayout>
          }
        />

        {/* Shipping */}
        <Route
          path="/admin/shipping"
          element={
            <DashboardLayout>
              <ShippingHome />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/shipping/receiving"
          element={
            <DashboardLayout>
              <ReceivingFromPlanning />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/shipping/inventory"
          element={
            <DashboardLayout>
              <Inventory />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/shipping/customers"
          element={
            <DashboardLayout>
              <Customers />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/shipping/shipments"
          element={
            <DashboardLayout>
              <Shipments />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/shipping/reports"
          element={
            <DashboardLayout>
              <ShippingReports />
            </DashboardLayout>
          }
        />
      </Route>

      {/* =========================
          Customer Service ( للموظفين العاديين )
      ========================= */}
      <Route element={<ProtectedRoute allowedRoles={["customer_service"]} />}>
        <Route
          path="/customer_service"
          element={
            <DashboardLayout>
              <CustomerServiceHome />
            </DashboardLayout>
          }
        />
        <Route
          path="/customer_service/add_brand"
          element={
            <DashboardLayout>
              <Brands />
            </DashboardLayout>
          }
        />
        <Route
          path="/customer_service/brands"
          element={
            <DashboardLayout>
              <AllBrands />
            </DashboardLayout>
          }
        />
        <Route
          path="/customer_service/edit_brands/:id"
          element={
            <DashboardLayout>
              <EditBrands />
            </DashboardLayout>
          }
        />
        <Route
          path="/customer_service/collections"
          element={
            <DashboardLayout>
              <AllCollections />
            </DashboardLayout>
          }
        />
        <Route
          path="/customer_service/add_collection"
          element={
            <DashboardLayout>
              <AddCollection />
            </DashboardLayout>
          }
        />
        <Route
          path="/customer_service/models"
          element={
            <DashboardLayout>
              <Models />
            </DashboardLayout>
          }
        />
        <Route
          path="/customer_service/edit_collection/:id"
          element={
            <DashboardLayout>
              <EditCollection />
            </DashboardLayout>
          }
        />
        <Route
          path="/customer_service/customer_followup"
          element={
            <DashboardLayout>
              <CustomerFollowup />
            </DashboardLayout>
          }
        />
        <Route
          path="/customer_service/models_assistant"
          element={
            <DashboardLayout>
              <ModelsAssistant />
            </DashboardLayout>
          }
        />
        <Route
          path="/customer_service/pricing"
          element={
            <DashboardLayout>
              <Pricing />
            </DashboardLayout>
          }
        />
        <Route
          path="/customer_service/quotations"
          element={
            <DashboardLayout>
              <Quotations />
            </DashboardLayout>
          }
        />
        <Route
          path="/customer_service/start_order/:id"
          element={
            <DashboardLayout>
              <StartOrder />
            </DashboardLayout>
          }
        />
      </Route>

      {/* =========================
          Planning ( للموظفين العاديين )
      ========================= */}
      <Route element={<ProtectedRoute allowedRoles={["planning"]} />}>
        <Route
          path="/planning"
          element={
            <DashboardLayout>
              <PlanningHome />
            </DashboardLayout>
          }
        />
        <Route
          path="/planning/collections"
          element={
            <DashboardLayout>
              <CollectionsFromCS />
            </DashboardLayout>
          }
        />
        <Route
          path="/planning/checklist/:id"
          element={
            <DashboardLayout>
              <Checklist />
            </DashboardLayout>
          }
        />
        <Route
          path="/planning/deliverables_schedule"
          element={
            <DashboardLayout>
              <DeliverablesSchedule />
            </DashboardLayout>
          }
        />
        <Route
          path="/planning/planning_engineer"
          element={
            <DashboardLayout>
              <PlanningEngineer />
            </DashboardLayout>
          }
        />
      </Route>

      {/* =========================
          Shipping & Inventory ( للموظفين العاديين )
      ========================= */}
      <Route element={<ProtectedRoute allowedRoles={["warehouse"]} />}>
        <Route
          path="/shipping"
          element={
            <DashboardLayout>
              <ShippingHome />
            </DashboardLayout>
          }
        />
        <Route
          path="/shipping/receiving"
          element={
            <DashboardLayout>
              <ReceivingFromPlanning />
            </DashboardLayout>
          }
        />
        <Route
          path="/shipping/inventory"
          element={
            <DashboardLayout>
              <Inventory />
            </DashboardLayout>
          }
        />
        <Route
          path="/shipping/customers"
          element={
            <DashboardLayout>
              <Customers />
            </DashboardLayout>
          }
        />
        <Route
          path="/shipping/shipments"
          element={
            <DashboardLayout>
              <Shipments />
            </DashboardLayout>
          }
        />
        <Route
          path="/shipping/reports"
          element={
            <DashboardLayout>
              <ShippingReports />
            </DashboardLayout>
          }
        />
      </Route>

      {/* =========================
          Management ( للموظفين العاديين )
      ========================= */}
      <Route element={<ProtectedRoute allowedRoles={["management"]} />}>
        <Route
          path="/managments"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/managments/brands"
          element={
            <DashboardLayout>
              <Brands />
            </DashboardLayout>
          }
        />
        <Route
          path="/managments/edit_brands/:id"
          element={
            <DashboardLayout>
              <EditBrands />
            </DashboardLayout>
          }
        />
        <Route
          path="/managments/edit_collection/:id"
          element={
            <DashboardLayout>
              <EditCollection />
            </DashboardLayout>
          }
        />
        <Route
          path="/managments/orders_followup"
          element={
            <DashboardLayout>
              <OrdersFollowup />
            </DashboardLayout>
          }
        />
        <Route
          path="/managments/edits_history"
          element={
            <DashboardLayout>
              <EditsHistory />
            </DashboardLayout>
          }
        />
        <Route
          path="/managments/knowledge_base"
          element={
            <DashboardLayout>
              <KnowledgeBase />
            </DashboardLayout>
          }
        />
        <Route
          path="/managments/reports"
          element={
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          }
        />
        <Route
          path="/managments/approvals"
          element={
            <DashboardLayout>
              <Approvals />
            </DashboardLayout>
          }
        />
      </Route>

      <Route path="/client-portal/*" element={<ClientDashboard />} />

      {/* =========================
          404
      ========================= */}
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
}

export default App;
