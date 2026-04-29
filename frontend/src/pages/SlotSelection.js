import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";

function SlotSelection() {
  const { locationId } = useParams();
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchSlots();
  }, [locationId]);

  const fetchSlots = async () => {
    try {
      const res = await API.get(`/parking/${locationId}/slots`);
      setSlots(res.data);
    } catch (error) {
      console.log("Slot Fetch Error:", error);
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
        <h2>Select Parking Slot</h2>
        <p className="text-muted">Click a green slot to book it instantly</p>

        {/* Legend */}
        <div className="d-flex gap-4 mt-3 mb-3 flex-wrap">
          <span className="badge bg-success">🟢 Available — Click to Book</span>
          <span className="badge bg-danger">🔴 Occupied — Already Booked</span>
          <span className="badge bg-warning text-dark">🟡 Reserved</span>
        </div>

        {/* Slot Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "20px",
          }}
        >
          {slots.map((slot) => {
            const status = slot.display_status || slot.status;
            const isAvailable = status === "available";
            const isOccupied = status === "occupied";

            return (
              <div
                key={slot.id}
                className="card text-white"
                style={{
                  backgroundColor: getSlotColor(status),
                  border: getSlotBorder(status),
                  cursor: isAvailable ? "pointer" : "default",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (isAvailable) e.currentTarget.style.transform = "scale(1.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <div className="card-body text-center p-3">
                  <h4 className="mb-1 fw-bold">{slot.slot_number}</h4>
                  <small className="text-uppercase d-block mb-2">
                    {status}
                  </small>

                  {/* Occupied Info */}
                  {isOccupied && slot.active_booking_code && (
                    <div
                      className="bg-dark bg-opacity-25 rounded p-1 mb-2"
                      style={{ fontSize: "0.7rem" }}
                    >
                      <div>🚗 {slot.active_vehicle_type}</div>
                      <div>{slot.active_vehicle_number}</div>
                      <div>⏰ {slot.active_start_time} ({slot.active_duration}h)</div>
                    </div>
                  )}

                  {/* Action Button */}
                  {isAvailable ? (
                    <button
                      className="btn btn-light btn-sm fw-bold w-100"
                      style={{ color: "#1e7e34" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBook(slot.id);
                      }}
                    >
                      📌 Book Now
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-light btn-sm w-100"
                      disabled
                      style={{ opacity: 0.6 }}
                    >
                      {isOccupied ? "❌ Occupied" : "Reserved"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Occupied Slot Detail Panel */}
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
              <button
                className="btn btn-sm btn-outline-dark mt-2"
                onClick={() => setSelectedSlot(null)}
              >
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

