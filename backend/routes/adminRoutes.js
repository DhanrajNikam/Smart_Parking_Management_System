const express = require("express");
const router = express.Router();

// Controllers
const {
  getDashboardStats,
  getMonthlyRevenue,
  getTopLocations,
  getDailyBookingTrend,
  getVehicleTypeAnalytics,
  getRevenueByLocation,
  getYearlyRevenue,
  getProfitLossSummary,
  getPeakHourAnalytics,
  getAllBookings,
  forceCancelBooking,
  getAllUsers,
  getFilteredBookings,
  changeUserRole,
  getParkingUtilization,
  getMostUsedParkingArea,
    getLeastUsedParkingArea, // ✅ ADD THIS
updateBookingStatus,
getAdvancedFilteredBookings,
exportBookingsExcel,
toggleUserStatus


} = require("../controllers/adminController");

// Middleware
const {
  verifyToken,
  verifyAdmin
} = require("../middleware/authMiddleware");


// =====================================
// 📊 Dashboard Stats
// GET /api/admin/dashboard
// =====================================
router.get(
  "/dashboard",
  verifyToken,
  verifyAdmin,
  getDashboardStats
);


// =====================================
// 📈 Monthly Revenue Chart
// GET /api/admin/monthly-revenue
// =====================================
router.get(
  "/monthly-revenue",
  verifyToken,
  verifyAdmin,
  getMonthlyRevenue
);


// =====================================
// 🏆 Top 5 Locations Leaderboard
// GET /api/admin/top-locations
// =====================================
router.get(
  "/top-locations",
  verifyToken,
  verifyAdmin,
  getTopLocations
);


// =====================================
// 📅 Daily Booking Trend (Last 7 Days)
// GET /api/admin/daily-trend
// =====================================
router.get(
  "/daily-trend",
  verifyToken,
  verifyAdmin,
  getDailyBookingTrend
);


// =====================================
// 🚗 Vehicle Type Analytics
// GET /api/admin/vehicle-analytics
// =====================================
router.get(
  "/vehicle-analytics",
  verifyToken,
  verifyAdmin,
  getVehicleTypeAnalytics
);


// =====================================
// 💰 Revenue Per Location
// GET /api/admin/revenue-by-location
// =====================================
router.get(
  "/revenue-by-location",
  verifyToken,
  verifyAdmin,
  getRevenueByLocation
);


// =====================================
// 📊 12 Month Fixed Revenue Chart
// GET /api/admin/yearly-revenue
// =====================================
router.get(
  "/yearly-revenue",
  verifyToken,
  verifyAdmin,
  getYearlyRevenue
);


// =====================================
// 📈 Profit & Loss Summary
// GET /api/admin/profit-loss
// =====================================
router.get(
  "/profit-loss",
  verifyToken,
  verifyAdmin,
  getProfitLossSummary
);


// =====================================
// ⏰ Peak Hour Analytics (24 Hours)
// GET /api/admin/peak-hours
// =====================================
router.get(
  "/peak-hours",
  verifyToken,
  verifyAdmin,
  getPeakHourAnalytics
);

// =====================================
// 📂 View All Bookings
// GET /api/admin/bookings
// =====================================
router.get(
  "/bookings",
  verifyToken,
  verifyAdmin,
  getAllBookings
);

// =====================================
// ❌ Force Cancel Booking
// PUT /api/admin/bookings/:id/cancel
// =====================================
router.put(
  "/bookings/:id/cancel",
  verifyToken,
  verifyAdmin,
  forceCancelBooking
);

// =====================================
// 👤 View All Users
// GET /api/admin/users
// =====================================
router.get(
  "/users",
  verifyToken,
  verifyAdmin,
  getAllUsers
);

// Change user role
router.put(
  "/users/:id/role",
  verifyToken,
  verifyAdmin,
   changeUserRole
);


router.get(
  "/bookings/filter",
  verifyToken,
  verifyAdmin,
  getFilteredBookings
);

router.get(
  "/utilization",
  verifyToken,
  verifyAdmin,
  getParkingUtilization
);


router.get(
  "/analytics/most-used-area",
  verifyToken,
  verifyAdmin,
  getMostUsedParkingArea
);

router.get(
  "/analytics/least-used-area",
  verifyToken,
  verifyAdmin,
  getLeastUsedParkingArea
);


router.put(
  "/bookings/:id/status",
  verifyToken,
  verifyAdmin,
  updateBookingStatus
);


router.get(
  "/bookings/advanced",
  verifyToken,
  verifyAdmin,
  getAdvancedFilteredBookings
);

router.get(
  "/export/bookings",
  verifyToken,
  verifyAdmin,
  exportBookingsExcel
);

router.put(
  "/users/:id/status",
  verifyToken,
  verifyAdmin,
  toggleUserStatus
);

module.exports = router;