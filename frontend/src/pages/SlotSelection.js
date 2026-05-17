import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import ReviewRatingCard from "../components/ReviewRatingCard";
import RatingSummary from "../components/RatingSummary";

function SlotSelection() {
  const { locationId } = useParams();
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [reviewsPayload, setReviewsPayload] = useState({
    average_rating: 0,
    total_reviews: 0,
    reviews: []
  });

  useEffect(() => {
    fetchSlots();
    fetchLocationReviews();
  }, [locationId]);

  const fetchSlots = async () => {
    try {
      const res = await API.get(`/parking/${locationId}/slots`);
      setSlots(res.data);
    } catch (error) {
      console.log("Slot Fetch Error:", error);
    }
  };

  const fetchLocationReviews = async () => {
    try {
      const res = await API.get(`/parking/${locationId}/reviews`);
      setReviewsPayload(res.data || { reviews: [] });
    } catch (error) {
      console.log("Reviews Fetch Error:", error);
    }
  };


  const handleBook = (slotId) => {
    navigate(`/booking/${slotId}?location=${locationId}`);
  };

  const handleSlotClick = (slot) => {
    const status = slot.display_status || slot.status;
    if (status === "available") {
      handleBook(slot.id);
    } else if (status === "reserved") {
      alert("Slot reserved for future booking");
    } else {
      setSelectedSlot(slot);
    }
  };

  const getSlotColor = (status) => {
    if (status === "available") return "#28a745";
    if (status === "occupied") return "#dc3545";
    if (status === "reserved") return "#ffc107";
    return "#6c757d";
  };

  const getSlotBorder = (status) => {
    if (status === "available") return "3px solid #1e7e34";
    if (status === "occupied") return "3px solid #a71d2a";
    if (status === "reserved") return "3px solid #d39e00";
    return "3px solid #495057";
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h2 className="sp-title">Select Parking Slot</h2>
        <p className="text-muted mb-3">Click an available slot to book it instantly</p>

        {/* LEGEND */}
        <div className="sp-legend mb-3" aria-label="Slot status legend">
          <span className="sp-pill available">🟢 Available — Click to Book</span>
          <span className="sp-pill occupied">🔴 Occupied — Already Booked</span>
          <span className="sp-pill reserved">🟡 Reserved — Starting Soon</span>
        </div>

        {/* SLOT GRID (primary action) */}
        <div className="sp-slot-grid mb-4">
          {slots.map((slot) => {
            const status = slot.display_status || slot.status;
            const isAvailable = status === "available";
            const isOccupied = status === "occupied";
            const isReserved = status === "reserved";

            return (
              <div
                key={slot.id}
                className="sp-slot-card"
                style={{ backgroundColor: getSlotColor(status), border: getSlotBorder(status) }}
                onClick={() => handleSlotClick(slot)}
              >
                <div className="sp-slot-inner">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div className="sp-slot-number">{slot.slot_number}</div>
                    <div className="sp-slot-chip">
                      {isAvailable ? "AVAILABLE" : isOccupied ? "OCCUPIED" : "RESERVED"}
                    </div>
                  </div>

                  {isOccupied && slot.active_booking_code && (
                    <div style={{ background: "rgba(0,0,0,0.18)", borderRadius: 12, padding: 8 }}>
                      <div style={{ fontWeight: 900, fontSize: 12 }}>🚗 {slot.active_vehicle_type}</div>
                      <div style={{ fontSize: 12, opacity: 0.95, fontWeight: 800 }}>{slot.active_vehicle_number}</div>
                      <div style={{ fontSize: 12, opacity: 0.95, fontWeight: 800 }}>
                        ⏰ {slot.active_start_time} ({slot.active_duration}h)
                      </div>
                    </div>
                  )}

                  {isReserved && <div style={{ fontWeight: 900, fontSize: 13, marginTop: 2 }}>⏳ Starting Soon</div>}

                  {isAvailable ? (
                    <button
                      className="sp-slot-btn available"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBook(slot.id);
                      }}
                    >
                      📌 Book Now
                    </button>
                  ) : (
                    <button
                      className={`sp-slot-btn ${isOccupied ? "occupied" : "reserved"}`}
                      disabled
                      style={{ opacity: isOccupied ? 0.75 : 0.9 }}
                    >
                      {isOccupied ? "❌ OCCUPIED" : "🟡 RESERVED"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* PARKING INFORMATION (below slots) */}
        <div className="sp-summary-card p-4 mb-4">
          <div className="sp-summary-grid">
            <div className="sp-summary-left">
              <div className="sp-summary-head">
                <div className="sp-summary-paragraph" style={{ fontSize: 12 }}>
                  Parking Info
                </div>
                <div style={{ fontWeight: 950, fontSize: 22, letterSpacing: "-0.02em" }}>
                  {slots?.[0]?.parking_name || slots?.[0]?.location_name || "CBS Parking"}
                </div>
                <div style={{ color: "#475569", fontWeight: 700, marginTop: 2 }}>
                  📍 {slots?.[0]?.address || slots?.[0]?.location_address || "Mahatma Nagar, Nashik"}
                </div>
                <div className="text-muted" style={{ fontWeight: 800, marginTop: 2 }}>
                  📍 {slots?.[0]?.distance_km || "8.9"} km away
                </div>
              </div>
            </div>

            <div className="sp-summary-right">
              <div className="sp-metric">
                <div className="sp-metric-icon">⭐</div>
                <div>
                  <div className="sp-metric-label">Average Rating</div>
                  <div className="sp-metric-value">{Number(reviewsPayload?.average_rating || 0).toFixed(1)}</div>
                </div>
              </div>

              <div className="sp-metric">
                <div className="sp-metric-icon">📝</div>
                <div>
                  <div className="sp-metric-label">Total Reviews</div>
                  <div className="sp-metric-value">{reviewsPayload?.total_reviews || 0}</div>
                </div>
              </div>

              <div className="sp-metric">
                <div className="sp-metric-icon">🅿️</div>
                <div>
                  <div className="sp-metric-label">Available Slots</div>
                  <div className="sp-metric-value">{slots.filter((s) => (s.display_status || s.status) === "available").length}</div>
                </div>
              </div>

              <div className="sp-metric">
                <div className="sp-metric-icon">💰</div>
                <div>
                  <div className="sp-metric-label">Price per hour</div>
                  <div className="sp-metric-value">₹{slots?.[0]?.price_per_hour || 50}/hr</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        <div className="mt-4">
          <h4 className="fw-bold mb-3">Recent Reviews</h4>
          {reviewsPayload?.reviews?.length ? (
            <div className="sp-review-grid">
              {reviewsPayload.reviews.map((r) => (
                <ReviewRatingCard key={r.id} review={r} />
              ))}
            </div>
          ) : (
            <div className="alert alert-light shadow-sm">No reviews yet</div>
          )}
        </div>

        {/* Occupied Slot Detail Panel (unchanged) */}
        {selectedSlot && (selectedSlot.display_status || selectedSlot.status) === "occupied" && (
          <div className="mt-4">
            <div className="alert alert-danger">
              <h5>🔴 Slot {selectedSlot.slot_number} is Occupied</h5>
              {selectedSlot.active_booking_code ? (
                <div className="mt-2">
                  <p className="mb-1">
                    <b>Booking ID:</b> {selectedSlot.active_booking_code}
                  </p>
                  <p className="mb-1">
                    <b>Date:</b> {selectedSlot.active_booking_date}
                  </p>
                  <p className="mb-1">
                    <b>Time:</b> {selectedSlot.active_start_time} ({selectedSlot.active_duration} hr)
                  </p>
                  <p className="mb-1">
                    <b>Vehicle:</b> {selectedSlot.active_vehicle_type} — {selectedSlot.active_vehicle_number}
                  </p>
                  <p className="mb-0">
                    <b>Booked By:</b> {selectedSlot.booked_by_user || "Unknown"}
                  </p>
                </div>
              ) : (
                <p className="mb-0">This slot is currently unavailable.</p>
              )}
              <button className="btn btn-sm btn-outline-dark mt-2" onClick={() => setSelectedSlot(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SlotSelection;

