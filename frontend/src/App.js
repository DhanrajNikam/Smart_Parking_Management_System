import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import SlotSelection from "./pages/SlotSelection";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import MyBookings from "./pages/MyBookings";
import Notifications from "./pages/Notifications";
import Rating from "./pages/Rating";

import Wallet from "./pages/Wallet";
import WalletHistory from "./pages/WalletHistory";
import RefundRequest from "./pages/RefundRequest";

import Support from "./pages/Support";
import SupportCenter from "./pages/SupportCenter";

import AdminDashboard from "./admin/AdminDashboard";
import ManageParking from "./admin/ManageParking";
import Bookings from "./admin/Bookings";
import Users from "./admin/Users";
import Reports from "./admin/Reports";
import RefundRequests from "./admin/RefundRequests";
import AdminSupport from "./admin/AdminSupport";
import GuardScanner from "./pages/GuardScanner";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}

        <Route path="/" element={<HomePage />} />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />


        <Route
          path="/support"
          element={<Support />}
        />

        {/* ================= USER ROUTES ================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/slots/:locationId"
          element={
            <ProtectedRoute>
              <SlotSelection />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking/:slotId"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment/:bookingId"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/confirmation"
          element={
            <ProtectedRoute>
              <Confirmation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mybookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        {/* ⭐ RATING PAGE */}

        <Route
          path="/rating"
          element={
            <ProtectedRoute>
              <Rating />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* ================= SUPPORT ================= */}

        <Route
          path="/support-center"
          element={
            <ProtectedRoute>
              <SupportCenter />
            </ProtectedRoute>
          }
        />

        <Route path="/guard-scanner" element={<GuardScanner />} />


        {/* ================= WALLET ================= */}

        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wallet/transactions"
          element={
            <ProtectedRoute>
              <WalletHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/refund/request"
          element={
            <ProtectedRoute>
              <RefundRequest />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/manage-parking"
          element={
            <ProtectedRoute adminOnly>
              <ManageParking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute adminOnly>
              <Bookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute adminOnly>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/refund-requests"
          element={
            <ProtectedRoute adminOnly>
              <RefundRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/support-tickets"
          element={
            <ProtectedRoute adminOnly>
              <AdminSupport />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;