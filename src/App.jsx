import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import CustomerServiceHome from "./pages/customer_service/Home";
import ModelsAssistant from "./pages/customer_service/ModelsAssistant";
import PlanningHome from "./pages/planning/Home";
import DeliverablesSchedule from "./pages/planning/DeliverablesSchedule";
import LateCollections from "./pages/planning/LateCollections";
import PlanningEngineer from "./pages/planning/PlanningEngineer";
import Dashboard from "./pages/managments/Dashboard";
import EditsHistory from "./pages/managments/EditsHistory";
import KnowledgeBase from "./pages/managments/KnowledgeBase";
import Reports from "./pages/managments/Reports";
import SahabaAssistant from "./pages/managments/SahabaAssistant";
import ShippingHome from "./pages/shippingAndBarren/Home";
import Brands from "./features/brands/Brands";
import AllCollections from "./features/collections/AllCollections";
import DailyUpdate from "./features/dailyUpdate/DailyUpdate";
import Pricing from "./features/pricing/Pricing";
import DashboardLayout from "./layouts/DashboardLayout";
import CollectionsFollowUp from "./features/collections/CollectionsFollowUp";
import EditBrands from "./features/brands/EditBrands";
import EditCollection from "./features/collections/EditCollection";
import CustomerFollowup from "./pages/customer_service/CustomerFollowup";
import AddCollection from "./features/collections/AddCollection";
import Models from "./features/models/Models";
import OrdersFollowup from "./pages/managments/OrdersFollowup";
import Approvals from "./pages/managments/Approvals";
import ReceivingFromPlanning from "./pages/shippingAndBarren/ReceivingFromPlanning";
import Inventory from "./pages/shippingAndBarren/Inventory";
import Customers from "./pages/shippingAndBarren/Customers";
import Shipments from "./pages/shippingAndBarren/Shipments";
import ShippingReports from "./pages/shippingAndBarren/ShippingReports";
import StartOrder from "./pages/customer_service/StartOrder";
import AllBrands from "./pages/customer_service/AllBrands";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* Customer Service Pages */}
      <Route
        path="/customer_service"
        element={
          <DashboardLayout role="customer_service">
            <CustomerServiceHome />
          </DashboardLayout>
        }
      />
      <Route
        path="/customer_service/add_brand"
        element={
          <DashboardLayout role="customer_service">
            <Brands />
          </DashboardLayout>
        }
      />
      <Route
        path="/customer_service/brands"
        element={
          <DashboardLayout role="customer_service">
            <AllBrands />
          </DashboardLayout>
        }
      />
      <Route
        path="/customer_service/edit_brands/:brandId"
        element={
          <DashboardLayout role="customer_service">
            <EditBrands />
          </DashboardLayout>
        }
      />
      <Route
        path="/customer_service/collections"
        element={
          <DashboardLayout role="customer_service">
            <AllCollections />
          </DashboardLayout>
        }
      />
      <Route
        path="/customer_service/add_collection"
        element={
          <DashboardLayout role="customer_service">
            <AddCollection />
          </DashboardLayout>
        }
      />
      <Route
        path="/customer_service/models"
        element={
          <DashboardLayout role="customer_service">
            <Models />
          </DashboardLayout>
        }
      />
      <Route
        path="/customer_service/edit_collection/:collectionId"
        element={
          <DashboardLayout role="customer_service">
            <EditCollection />
          </DashboardLayout>
        }
      />
      <Route
        path="/customer_service/daily_update"
        element={
          <DashboardLayout role="customer_service">
            <DailyUpdate />
          </DashboardLayout>
        }
      />
      <Route
        path="/customer_service/customer_followup"
        element={
          <DashboardLayout role="customer_service">
            <CustomerFollowup />
          </DashboardLayout>
        }
      />
      <Route
        path="/customer_service/models_assistant"
        element={
          <DashboardLayout role="customer_service">
            <ModelsAssistant />
          </DashboardLayout>
        }
      />
      <Route
        path="/customer_service/pricing"
        element={
          <DashboardLayout role="customer_service">
            <Pricing />
          </DashboardLayout>
        }
      />
      <Route
        path="/customer_service/start_order/:id"
        element={
          <DashboardLayout role="customer_service">
            <StartOrder />
          </DashboardLayout>
        }
      />

      {/* Planning Pages */}
      <Route
        path="/planning"
        element={
          <DashboardLayout role="planning">
            <PlanningHome />
          </DashboardLayout>
        }
      />
      <Route
        path="/planning/collections_followup"
        element={
          <DashboardLayout role="planning">
            <CollectionsFollowUp />
          </DashboardLayout>
        }
      />
      <Route
        path="/planning/collections"
        element={
          <DashboardLayout role="planning">
            <AllCollections />
          </DashboardLayout>
        }
      />
      <Route
        path="/planning/daily_update"
        element={
          <DashboardLayout role="planning">
            <DailyUpdate />
          </DashboardLayout>
        }
      />
      <Route
        path="/planning/deliverables_schedule"
        element={
          <DashboardLayout role="planning">
            <DeliverablesSchedule />
          </DashboardLayout>
        }
      />
      <Route
        path="/planning/late_collections"
        element={
          <DashboardLayout role="planning">
            <LateCollections />
          </DashboardLayout>
        }
      />
      <Route
        path="/planning/planning_engineer"
        element={
          <DashboardLayout role="planning">
            <PlanningEngineer />
          </DashboardLayout>
        }
      />

      {/* Shipping Pages */}
      <Route
        path="/shipping"
        element={
          <DashboardLayout role="shipping">
            <ShippingHome />
          </DashboardLayout>
        }
      />
      <Route
        path="/shipping/receiving"
        element={
          <DashboardLayout role="shipping">
            <ReceivingFromPlanning />
          </DashboardLayout>
        }
      />
      <Route
        path="/shipping/inventory"
        element={
          <DashboardLayout role="shipping">
            <Inventory />
          </DashboardLayout>
        }
      />
      <Route
        path="/shipping/customers"
        element={
          <DashboardLayout role="shipping">
            <Customers />
          </DashboardLayout>
        }
      />
      <Route
        path="/shipping/shipments"
        element={
          <DashboardLayout role="shipping">
            <Shipments />
          </DashboardLayout>
        }
      />
      <Route
        path="/shipping/reports"
        element={
          <DashboardLayout role="shipping">
            <ShippingReports />
          </DashboardLayout>
        }
      />

      {/* Management Pages */}
      <Route
        path="/managments"
        element={
          <DashboardLayout role="managments">
            <Dashboard />
          </DashboardLayout>
        }
      />
      <Route
        path="/managments/brands"
        element={
          <DashboardLayout role="managments">
            <Brands />
          </DashboardLayout>
        }
      />
      <Route
        path="/managments/orders_followup"
        element={
          <DashboardLayout role="managments">
            <OrdersFollowup />
          </DashboardLayout>
        }
      />
      <Route
        path="/managments/edits_history"
        element={
          <DashboardLayout role="managments">
            <EditsHistory />
          </DashboardLayout>
        }
      />
      <Route
        path="/managments/knowledge_base"
        element={
          <DashboardLayout role="managments">
            <KnowledgeBase />
          </DashboardLayout>
        }
      />
      <Route
        path="/managments/reports"
        element={
          <DashboardLayout role="managments">
            <Reports />
          </DashboardLayout>
        }
      />
      <Route
        path="/managments/approvals"
        element={
          <DashboardLayout role="managments">
            <Approvals />
          </DashboardLayout>
        }
      />

      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
}

export default App;
