import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";

function Confirmation() {
  const navigate = useNavigate();
  const [latestBooking, setLatestBooking] = useState(null);

  useEffect(() => {
    fetchLatestBooking();
  }, []);

  const fetchLatestBooking = async () => {
    try {
      const res = await API.get("/bookings/my?status=active");
      if (res.data.length > 0) {
        setLatestBooking(res.data[0]);
      } else {
        const allRes = await API.get("/bookings/my");
        if (allRes.data.length > 0) {
          setLatestBooking(allRes.data[0]);
        }
      }
    } catch (error) {
      console.log("Fetch booking error:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow p-4 text-center">
              <h2 className="text-success mb-3">🎉 Booking Confirmed</h2>
              <p>Your parking slot has been booked successfully.</p>

              {latestBooking ? (
                <div className="text-start bg-light p-3 rounded mb-3">
                  <p><b>Booking ID:</b> {latestBooking.booking_code}</p>
                  <p><b>Parking Location:</b> {latestBooking.parking_location}</p>
                  <p><b>Slot Number:</b> {latestBooking.slot_number}</p>
                  <p><b>Date:</b> {latestBooking.booking_date}</p>
                  <p><b>Start Time:</b> {latestBooking.start_time}</p>
                  <p><b>Duration:</b> {latestBooking.duration} hour(s)</p>
                  <p><b>Vehicle:</b> {latestBooking.vehicle_type} - {latestBooking.vehicle_number}</p>
                  <p><b>Total Paid:</b> ₹{latestBooking.total_price}</p>
                  <p><b>Status:</b> <span className="badge bg-success">{latestBooking.status}</span></p>
                </div>
              ) : (
                <p className="text-muted">Loading booking details...</p>
              )}

              <div className="d-flex gap-2 justify-content-center">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/mybookings")}
                >
                  View My Bookings
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Confirmation;

