import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [vehicleAnalytics, setVehicleAnalytics] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchMonthlyRevenue();
    fetchDailyTrend();
    fetchVehicleAnalytics();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/dashboard");
      setStats(res.data);
    } catch (error) {
      console.log("Stats error:", error);
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      const res = await API.get("/admin/monthly-revenue");
      setMonthlyRevenue(res.data);
    } catch (error) {
      console.log("Revenue error:", error);
    }
  };

  const fetchDailyTrend = async () => {
    try {
      const res = await API.get("/admin/daily-trend");
      setDailyTrend(res.data);
    } catch (error) {
      console.log("Trend error:", error);
    }
  };

  const fetchVehicleAnalytics = async () => {
    try {
      const res = await API.get("/admin/vehicle-analytics");
      setVehicleAnalytics(res.data);
    } catch (error) {
      console.log("Vehicle error:", error);
    }
  };

  const revenueChartData = {
    labels: monthlyRevenue.map((d) => d.month),
    datasets: [
      {
        label: "Revenue (₹)",
        data: monthlyRevenue.map((d) => d.revenue),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const trendChartData = {
    labels: dailyTrend.map((d) => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: "Bookings",
        data: dailyTrend.map((d) => d.bookings),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const vehicleChartData = {
    labels: vehicleAnalytics.map((d) => d.vehicle_type),
    datasets: [
      {
        data: vehicleAnalytics.map((d) => d.total_bookings),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  const statCards = [
    { label: "Total Bookings", value: stats.total_bookings || 0, color: "primary" },
    { label: "Active Bookings", value: stats.active_bookings || 0, color: "success" },
    { label: "Completed", value: stats.completed_bookings || 0, color: "info" },
    { label: "Cancelled", value: stats.cancelled_bookings || 0, color: "danger" },
    { label: "Total Slots", value: stats.total_parking_slots || 0, color: "secondary" },
    { label: "Available Slots", value: stats.available_slots || 0, color: "success" },
    { label: "Occupied Slots", value: stats.occupied_slots || 0, color: "warning" },
    { label: "Registered Users", value: stats.total_users || 0, color: "dark" },
    { label: "Today's Bookings", value: stats.todays_bookings || 0, color: "primary" },
    { label: "Total Revenue", value: `₹${stats.total_revenue || 0}`, color: "success" },
    { label: "Today's Revenue", value: `₹${stats.today_revenue || 0}`, color: "info" },
    { label: "Top Location", value: stats.top_location || "N/A", color: "primary" },
  ];

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h2>Admin Dashboard</h2>

        {/* Stats Grid */}
        <div className="row mt-4">
          {statCards.map((card, idx) => (
            <div className="col-md-3 mb-3" key={idx}>
              <div className={`card text-white bg-${card.color} shadow`}>
                <div className="card-body text-center">
                  <h6>{card.label}</h6>
                  <h3>{card.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card shadow p-3">
              <h5>Monthly Revenue</h5>
              <Bar data={revenueChartData} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow p-3">
              <h5>Daily Booking Trend (Last 7 Days)</h5>
              <Line data={trendChartData} />
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card shadow p-3">
              <h5>Vehicle Type Distribution</h5>
              <Pie data={vehicleChartData} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow p-3">
              <h5>Quick Actions</h5>
              <div className="d-grid gap-2">
                <button className="btn btn-primary" onClick={() => navigate("/admin/manage-parking")}>
                  Manage Parking
                </button>
                <button className="btn btn-success" onClick={() => navigate("/admin/bookings")}>
                  View All Bookings
                </button>
                <button className="btn btn-info" onClick={() => navigate("/admin/users")}>
                  Manage Users
                </button>
                <button className="btn btn-warning" onClick={() => navigate("/admin/reports")}>
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

