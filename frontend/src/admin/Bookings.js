import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, [filter, page]);

  const fetchBookings = async () => {
    try {
      const url = filter
        ? `/admin/bookings/advanced?status=${filter}&page=${page}&limit=10`
        : `/admin/bookings?page=${page}&limit=10`;
      const res = await API.get(url);
      if (res.data.bookings) {
        setBookings(res.data.bookings);
        setTotalPages(res.data.total_pages);
      } else {
        setBookings(res.data);
        setTotalPages(1);
      }
    } catch (error) {
      console.log("Fetch bookings error:", error);
    }
  };

  const forceCancel = async (id) => {
    if (!window.confirm("Force cancel this booking?")) return;
    try {
      await API.put(`/admin/bookings/${id}/cancel`);
      alert("Booking cancelled");
      fetchBookings();
    } catch (error) {
      alert("Cancel failed");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/admin/bookings/${id}/status`, { status });
      alert("Status updated");
      fetchBookings();
    } catch (error) {
      alert("Update failed");
    }
  };

  const exportExcel = async () => {
    try {
      const res = await API.get("/admin/export/bookings", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "bookings_report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Export failed");
    }
  };

  const getBadge = (status) => {
    const map = {
      active: "bg-success",
      pending: "bg-warning text-dark",
      completed: "bg-secondary",
      cancelled: "bg-danger"
    };
    return map[status] || "bg-secondary";
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Bookings Management</h2>
          <button className="btn btn-success" onClick={exportExcel}>
            📥 Export Excel
          </button>
        </div>

        <div className="mb-3">
          <select
            className="form-select"
            style={{ width: "200px" }}
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Location</th>
                <th>Slot</th>
                <th>Vehicle</th>
                <th>Date</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td><code>{b.booking_code || b.id}</code></td>
                  <td>{b.user_name}</td>
                  <td>{b.location_name || b.parking_location}</td>
                  <td>{b.slot_number}</td>
                  <td>{b.vehicle_type} - {b.vehicle_number}</td>
                  <td>{b.booking_date}</td>
                  <td>{b.start_time}</td>
                  <td>{b.duration} hr</td>
                  <td>₹{b.total_price}</td>
                  <td>
                    <span className={`badge ${getBadge(b.status)}`}>{b.status}</span>
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      {b.status !== "cancelled" && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => forceCancel(b.id)}
                        >
                          Cancel
                        </button>
                      )}
                      <select
                        className="form-select form-select-sm"
                        style={{ width: "110px" }}
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-outline-primary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span className="align-self-center">Page {page} of {totalPages}</span>
          <button
            className="btn btn-outline-primary btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Bookings;

