import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import AnprUploadCard from "./AnprUploadCard";


function Booking() {
  const { slotId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const locationId = queryParams.get("location");

  const [pricePerHour, setPricePerHour] = useState(40);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    location_id: locationId || "",
    vehicle_type: "car",
    vehicle_number: "",
    booking_date: "",
    start_time: "",
    duration: 1
  });

  useEffect(() => {
    if (locationId) {
      fetchLocationPrice(locationId);
    }
  }, [locationId]);

  const fetchLocationPrice = async (id) => {
    try {
      const res = await API.get(`/parking/${id}`);
      if (res.data.price_per_hour) {
        setPricePerHour(res.data.price_per_hour);
      }
    } catch (error) {
      console.log("Price fetch error:", error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const totalPrice = form.duration * pricePerHour;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const bookingData = {
        ...form,
        slot_id: slotId,
        total_price: totalPrice
      };

      const res = await API.post("/bookings/create", bookingData);

      alert("Booking created. Please complete payment.");
      const bookingId = res.data.booking_id;
      navigate(`/payment/${bookingId}`);

    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Booking failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow p-4">
              <h2>Book Parking Slot</h2>

              <div className="alert alert-info">
                <b>Price:</b> ₹{pricePerHour}/hour
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label>Location ID</label>
                  <input
                    type="number"
                    name="location_id"
                    className="form-control"
                    value={form.location_id}
                    onChange={handleChange}
                    required
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label>Vehicle Type</label>
                  <select
                    name="vehicle_type"
                    className="form-control"
                    value={form.vehicle_type}
                    onChange={handleChange}
                  >
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="truck">Truck</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label>Vehicle Number</label>
                  <input
                    type="text"
                    name="vehicle_number"
                    className="form-control"
                    value={form.vehicle_number}
                    onChange={handleChange}
                    placeholder="e.g. MH-01-AB-1234"
                    required
                  />
                </div>

                <div className="mb-3">
                  <AnprUploadCard
                    onExtract={(extracted) => {
                      if (extracted) {
                        setForm((prev) => ({
                          ...prev,
                          vehicle_number: extracted
                        }));
                      }
                    }}
                  />
                </div>


                <div className="mb-3">
                  <label>Booking Date</label>
                  <input
                    type="date"
                    name="booking_date"
                    className="form-control"
                    value={form.booking_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Start Time</label>
                  <input
                    type="time"
                    name="start_time"
                    className="form-control"
                    value={form.start_time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Duration (Hours)</label>
                  <select
                    name="duration"
                    className="form-control"
                    value={form.duration}
                    onChange={handleChange}
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 12, 24].map((h) => (
                      <option key={h} value={h}>
                        {h} hour{h > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="alert alert-success">
                  <h5 className="mb-0">
                    Total Price: ₹{totalPrice}
                  </h5>
                </div>

                <button
                  className="btn btn-primary w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Processing...
                    </>
                  ) : (
                    "Continue to Payment"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Booking;
