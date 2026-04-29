import { useEffect, useState } from "react";
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

function Reports() {
  const [peakHours, setPeakHours] = useState([]);
  const [revenueByLocation, setRevenueByLocation] = useState([]);
  const [utilization, setUtilization] = useState({});
  const [mostUsed, setMostUsed] = useState({});
  const [leastUsed, setLeastUsed] = useState({});
  const [yearlyRevenue, setYearlyRevenue] = useState([]);

  useEffect(() => {
    fetchPeakHours();
    fetchRevenueByLocation();
    fetchUtilization();
    fetchMostUsed();
    fetchLeastUsed();
    fetchYearlyRevenue();
  }, []);

  const fetchPeakHours = async () => {
    try {
      const res = await API.get("/admin/peak-hours");
      setPeakHours(res.data);
    } catch (error) {
      console.log("Peak hours error:", error);
    }
  };

  const fetchRevenueByLocation = async () => {
    try {
      const res = await API.get("/admin/revenue-by-location");
      setRevenueByLocation(res.data);
    } catch (error) {
      console.log("Revenue location error:", error);
    }
  };

  const fetchUtilization = async () => {
    try {
      const res = await API.get("/admin/utilization");
      setUtilization(res.data);
    } catch (error) {
      console.log("Utilization error:", error);
    }
  };

  const fetchMostUsed = async () => {
    try {
      const res = await API.get("/admin/analytics/most-used-area");
      setMostUsed(res.data);
    } catch (error) {
      console.log("Most used error:", error);
    }
  };

  const fetchLeastUsed = async () => {
    try {
      const res = await API.get("/admin/analytics/least-used-area");
      setLeastUsed(res.data);
    } catch (error) {
      console.log("Least used error:", error);
    }
  };

  const fetchYearlyRevenue = async () => {
    try {
      const res = await API.get("/admin/yearly-revenue");
      setYearlyRevenue(res.data);
    } catch (error) {
      console.log("Yearly error:", error);
    }
  };

  const peakHourData = {
    labels: peakHours.map((d) => `${d.hour}:00`),
    datasets: [
      {
        label: "Bookings",
        data: peakHours.map((d) => d.bookings),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const revenueLocData = {
    labels: revenueByLocation.map((d) => d.location),
    datasets: [
      {
        label: "Revenue (₹)",
        data: revenueByLocation.map((d) => d.total_revenue),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const yearlyData = {
    labels: yearlyRevenue.map((d) => d.month),
    datasets: [
      {
        label: "Revenue (₹)",
        data: yearlyRevenue.map((d) => d.revenue),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h2>Reports & Analytics</h2>

        {/* Summary Cards */}
        <div className="row mt-4">
          <div className="col-md-3">
            <div className="card shadow p-3 text-center">
              <h6>Overall Utilization</h6>
              <h2>{utilization.utilization_percentage || 0}%</h2>
              <small>{utilization.occupied_slots || 0} / {utilization.total_slots || 0} slots</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow p-3 text-center">
              <h6>Most Used Area</h6>
              <h5>{mostUsed.location_name || "N/A"}</h5>
              <small>{mostUsed.total_bookings || 0} bookings</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow p-3 text-center">
              <h6>Least Used Area</h6>
              <h5>{leastUsed.location_name || "N/A"}</h5>
              <small>{leastUsed.total_bookings || 0} bookings</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow p-3 text-center">
              <h6>Total Locations</h6>
              <h2>{revenueByLocation.length}</h2>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card shadow p-3">
              <h5>Peak Hours Analysis (24h)</h5>
              <Bar data={peakHourData} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow p-3">
              <h5>Revenue per Location</h5>
              <Bar data={revenueLocData} />
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-12">
            <div className="card shadow p-3">
              <h5>Yearly Revenue Trend</h5>
              <Line data={yearlyData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;

