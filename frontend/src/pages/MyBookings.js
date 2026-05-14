// import { useEffect, useState } from "react";
// import API from "../services/api";
// import Navbar from "../components/Navbar";

// function MyBookings() {
//   const [bookings, setBookings] = useState([]);
//   const [activeTab, setActiveTab] = useState("all");
//   const [extendId, setExtendId] = useState(null);
//   const [extendHours, setExtendHours] = useState(1);

//   useEffect(() => {
//     fetchBookings();
//   }, [activeTab]);

//   const fetchBookings = async () => {
//     try {
//       const statusParam = activeTab === "all" ? "" : `?status=${activeTab}`;
//       const res = await API.get(`/bookings/my${statusParam}`);
//       setBookings(res.data);
//     } catch (error) {
//       console.log("Fetch bookings error:", error);
//     }
//   };

//   const cancelBooking = async (id) => {
//     if (!window.confirm("Cancel this booking?")) return;
//     try {
//       await API.put(`/bookings/cancel/${id}`);
//       alert("Booking cancelled");
//       fetchBookings();
//     } catch (error) {
//       alert(error.response?.data?.message || "Cancel failed");
//     }
//   };

//   const handleExtend = async (id) => {
//     try {
//       await API.put(`/bookings/extend/${id}`, { extra_hours: extendHours });
//       alert(`Booking extended by ${extendHours} hour(s)`);
//       setExtendId(null);
//       fetchBookings();
//     } catch (error) {
//       alert(error.response?.data?.message || "Extend failed");
//     }
//   };

//   const getStatusBadge = (status) => {
//     const map = {
//       active: "bg-success",
//       pending: "bg-warning text-dark",
//       completed: "bg-secondary",
//       cancelled: "bg-danger"
//     };
//     return map[status] || "bg-secondary";
//   };

//   const tabs = [
//     { key: "all", label: "All Bookings" },
//     { key: "active", label: "Active" },
//     { key: "completed", label: "Completed" },
//     { key: "cancelled", label: "Cancelled" }
//   ];

//   return (
//     <div>
//       <Navbar />
//       <div className="container mt-4">
//         <h2>My Bookings</h2>

//         <ul className="nav nav-tabs mt-3">
//           {tabs.map((t) => (
//             <li className="nav-item" key={t.key}>
//               <button
//                 className={`nav-link ${activeTab === t.key ? "active" : ""}`}
//                 onClick={() => setActiveTab(t.key)}
//               >
//                 {t.label}
//               </button>
//             </li>
//           ))}
//         </ul>

//         {bookings.length === 0 ? (
//           <p className="mt-3 text-muted">No bookings found.</p>
//         ) : (
//           <div className="table-responsive mt-3">
//             <table className="table table-bordered table-hover">
//               <thead className="table-dark">
//                 <tr>
//                   <th>Booking ID</th>
//                   <th>Parking</th>
//                   <th>Slot</th>
//                   <th>Date</th>
//                   <th>Time</th>
//                   <th>Duration</th>
//                   <th>Vehicle</th>
//                   <th>Price</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {bookings.map((b) => (
//                   <tr key={b.id}>
//                     <td><code>{b.booking_code}</code></td>
//                     <td>{b.parking_location}</td>
//                     <td>{b.slot_number}</td>
//                     <td>{b.booking_date}</td>
//                     <td>{b.start_time}</td>
//                     <td>{b.duration} hr</td>
//                     <td>{b.vehicle_type} - {b.vehicle_number}</td>
//                     <td>₹{b.total_price}</td>
//                     <td>
//                       <span className={`badge ${getStatusBadge(b.status)}`}>
//                         {b.status}
//                       </span>
//                     </td>
//                     <td>
//                       {b.status === "active" && (
//                         <div className="d-flex gap-1 flex-wrap">
//                           <button
//                             className="btn btn-danger btn-sm"
//                             onClick={() => cancelBooking(b.id)}
//                           >
//                             Cancel
//                           </button>
//                           {extendId === b.id ? (
//                             <div className="d-flex gap-1">
//                               <select
//                                 className="form-select form-select-sm"
//                                 style={{ width: "80px" }}
//                                 value={extendHours}
//                                 onChange={(e) => setExtendHours(Number(e.target.value))}
//                               >
//                                 <option value={0.5}>30 min</option>
//                                 <option value={1}>1 hr</option>
//                                 <option value={2}>2 hr</option>
//                               </select>
//                               <button
//                                 className="btn btn-success btn-sm"
//                                 onClick={() => handleExtend(b.id)}
//                               >
//                                 ✓
//                               </button>
//                               <button
//                                 className="btn btn-secondary btn-sm"
//                                 onClick={() => setExtendId(null)}
//                               >
//                                 ✕
//                               </button>
//                             </div>
//                           ) : (
//                             <button
//                               className="btn btn-primary btn-sm"
//                               onClick={() => setExtendId(b.id)}
//                             >
//                               Extend
//                             </button>
//                           )}
//                         </div>
//                       )}
//                       {b.status === "pending" && (
//                         <button
//                           className="btn btn-danger btn-sm"
//                           onClick={() => cancelBooking(b.id)}
//                         >
//                           Cancel
//                         </button>
//                       )}
//                       {(b.status === "completed" || b.status === "cancelled") && (
//                         <span className="text-muted">-</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default MyBookings;



import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";


function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [extendId, setExtendId] = useState(null);
  const [extendHours, setExtendHours] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      const statusParam = activeTab === "all" ? "" : `?status=${activeTab}`;
      const res = await API.get(`/bookings/my${statusParam}`);
      setBookings(res.data);
    } catch (error) {
      console.log("Fetch bookings error:", error);
    }
  };

  // ✅ FIX: Convert UTC → IST
  const formatDateTime = (date, time) => {
    const d = new Date(date);

    const [h, m, s] = time.split(":").map(Number);
    d.setHours(h, m, s || 0);

    return {
      date: d.toLocaleDateString("en-IN"),
      time: d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      })
    };
  };

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await API.put(`/bookings/cancel/${id}`);
      alert("Booking cancelled");
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || "Cancel failed");
    }
  };

  const handleExtend = async (id) => {
    try {
      await API.put(`/bookings/extend/${id}`, { extra_hours: extendHours });
      alert(`Booking extended by ${extendHours} hour(s)`);
      setExtendId(null);
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || "Extend failed");
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      active: "bg-success",
      pending: "bg-warning text-dark",
      completed: "bg-secondary",
      cancelled: "bg-danger"
    };
    return map[status] || "bg-secondary";
  };

  const tabs = [
    { key: "all", label: "All Bookings" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" }
  ];

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h2>My Bookings</h2>

        <ul className="nav nav-tabs mt-3">
          {tabs.map((t) => (
            <li className="nav-item" key={t.key}>
              <button
                className={`nav-link ${activeTab === t.key ? "active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>

        {bookings.length === 0 ? (
          <p className="mt-3 text-muted">No bookings found.</p>
        ) : (
          <div className="table-responsive mt-3">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Booking ID</th>
                  <th>Parking</th>
                  <th>Slot</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Vehicle</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((b) => {
                  const dt = formatDateTime(b.booking_date, b.start_time);

                  return (
                    <tr key={b.id}>
                      <td><code>{b.booking_code}</code></td>
                      <td>{b.parking_location}</td>
                      <td>{b.slot_number}</td>

                      {/* ✅ FIXED DATE + TIME */}
                      <td>{dt.date}</td>
                      <td>{dt.time}</td>

                      <td>{b.duration} hr</td>
                      <td>{b.vehicle_type} - {b.vehicle_number}</td>
                      <td>₹{b.total_price}</td>

                      <td>
                        <span className={`badge ${getStatusBadge(b.status)}`}>
                          {b.status}
                        </span>
                      </td>

                      <td>
                        {b.status === "active" && (
                          <div className="d-flex gap-1 flex-wrap">
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => cancelBooking(b.id)}
                            >
                              Cancel
                            </button>

                            {extendId === b.id ? (
                              <div className="d-flex gap-1">
                                <select
                                  className="form-select form-select-sm"
                                  style={{ width: "80px" }}
                                  value={extendHours}
                                  onChange={(e) =>
                                    setExtendHours(Number(e.target.value))
                                  }
                                >
                                  <option value={0.5}>30 min</option>
                                  <option value={1}>1 hr</option>
                                  <option value={2}>2 hr</option>
                                </select>

                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleExtend(b.id)}
                                >
                                  ✓
                                </button>

                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setExtendId(null)}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setExtendId(b.id)}
                              >
                                Extend
                              </button>
                            )}
                          </div>
                        )}

                      {b.status === "pending" && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => cancelBooking(b.id)}
                          >
                            Cancel
                          </button>
                        )}

                        {b.status === "active" ? null : b.status === "completed" ? (
                          <button
                            style={{
                              background: "#f59e0b",
                              color: "white",
                              border: "none",
                              padding: "8px 14px",
                              borderRadius: "6px",
                              cursor: "pointer"
                            }}
                            onClick={() =>
                              navigate("/rating", {
                                state: {
                                  booking_code: b.booking_code

                                }
                              })
                            }
                          >
                            ⭐ Rate
                          </button>
                        ) : (
                          b.status === "cancelled" && (
                            <span className="text-muted">-</span>
                          )
                        )}

                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;