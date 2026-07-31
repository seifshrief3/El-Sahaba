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

function App() {
  return (
    <Routes>
      {/* =========================
          Public Routes
      ========================= */}

      <Route path="/" element={<Login />} />

      <Route path="/login" element={<Login />} />

      {/* =========================
          Customer Service
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
          Planning
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
          Shipping & Inventory
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
          Management
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

      {/* =========================
          404
      ========================= */}

      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
}

export default App;
