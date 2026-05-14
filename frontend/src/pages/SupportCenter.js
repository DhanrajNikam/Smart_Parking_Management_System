import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function StatusBadge({ status }) {
  const cfg = {
    open: { className: "bg-warning text-dark", label: "Open" },
    pending: { className: "bg-info text-dark", label: "Pending" },
    resolved: { className: "bg-success", label: "Resolved" }
  };

  const c = cfg[status] || {
    className: "bg-secondary",
    label: status
  };

  return (
    <span className={`badge rounded-pill ${c.className}`}>
      {c.label}
    </span>
  );
}

function SupportCenter() {

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [tickets, setTickets] = useState([]);

  const [filters, setFilters] = useState({
    status: "",
    search: ""
  });

  const [form, setForm] = useState({
    subject: "",
    issue_type: "Booking Issue",
    booking_id: "",
    message: ""
  });

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: ""
  });

  const showToast = (type, message) => {

    setToast({
      show: true,
      type,
      message
    });

    setTimeout(() => {
      setToast((t) => ({
        ...t,
        show: false
      }));
    }, 3000);
  };

  const fetchTickets = async () => {

    try {

      setLoading(true);

      const res = await API.get("/support/my-tickets");

setTickets(Array.isArray(res.data.tickets)
  ? res.data.tickets
  : []);
    } catch (error) {

      console.log(error);

      showToast(
        "danger",
        error?.response?.data?.message || "Failed to load tickets"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e) => {

    e.preventDefault();

    try {

      setSubmitting(true);

      const payload = {
        subject: form.subject,
        issue_type: form.issue_type,
        booking_id: form.booking_id || null,
        message: form.message
      };

      const res = await API.post(
        "/support/tickets",
        payload
      );

      showToast(
        "success",
        res.data?.message || "Ticket submitted successfully"
      );

      setForm({
        subject: "",
        issue_type: "Booking Issue",
        booking_id: "",
        message: ""
      });

      fetchTickets();

    } catch (error) {

      console.log(error);

      showToast(
        "danger",
        error?.response?.data?.message || "Server error"
      );

    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {

    const matchStatus =
      !filters.status || t.status === filters.status;

    const matchSearch =
      !filters.search ||
      t.ticket_code?.toLowerCase().includes(filters.search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(filters.search.toLowerCase());

    return matchStatus && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fc" }}>

      {/* HEADER */}
      <div
        className="py-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(13,110,253,.12), rgba(139,92,246,.10), rgba(6,182,212,.10))"
        }}
      >
        <div className="container">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

            <div>
              <h2 className="fw-bold mb-1">
                Support Center
              </h2>

              <p className="text-muted mb-0">
                Raise a ticket, track status, and get admin replies.
              </p>
            </div>

            <div className="d-flex gap-2">

              <Link
                to="/mybookings"
                className="btn btn-outline-primary"
                style={{ borderRadius: 14 }}
              >
                Attach Booking ID
              </Link>

              <button
                className="btn btn-primary"
                style={{ borderRadius: 14 }}
                onClick={() => {
                  const el = document.getElementById("raise-ticket");

                  if (el) {
                    el.scrollIntoView({
                      behavior: "smooth"
                    });
                  }
                }}
              >
                Raise Ticket
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* BODY */}
      <div className="container py-4">

        {/* TOAST */}
        {toast.show && (
          <div className={`alert alert-${toast.type}`}>
            {toast.message}
          </div>
        )}

        <div className="row g-4">

          {/* FORM */}
          <div className="col-lg-5">

            <div
              id="raise-ticket"
              className="card border-0 shadow-sm"
              style={{
                borderRadius: 20,
                overflow: "hidden"
              }}
            >

              <div
                className="p-4 text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #0d6efd, #38bdf8)"
                }}
              >
                <h4 className="fw-bold">
                  Raise Support Ticket
                </h4>

                <p className="mb-0">
                  Describe your issue.
                </p>
              </div>

              <div className="p-4">

                <form onSubmit={handleCreateTicket}>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Subject
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      style={{ borderRadius: 14 }}
                      required
                      value={form.subject}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          subject: e.target.value
                        })
                      }
                      placeholder="Enter subject"
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Issue Type
                    </label>

                    <select
                      className="form-select"
                      style={{ borderRadius: 14 }}
                      value={form.issue_type}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          issue_type: e.target.value
                        })
                      }
                    >
                      <option value="Booking Issue">
                        Booking Issue
                      </option>

                      <option value="Refund Issue">
                        Refund Issue
                      </option>

                      <option value="Payment Issue">
                        Payment Issue
                      </option>

                      <option value="Slot/Parking Issue">
                        Slot/Parking Issue
                      </option>

                      <option value="Emergency Issue">
                        Emergency Issue
                      </option>

                    </select>

                  </div>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Booking ID (optional)
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      style={{ borderRadius: 14 }}
                      value={form.booking_id}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          booking_id: e.target.value
                        })
                      }
                      placeholder="Enter booking code"
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Message
                    </label>

                    <textarea
                      className="form-control"
                      style={{
                        borderRadius: 14,
                        minHeight: 120
                      }}
                      required
                      value={form.message}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          message: e.target.value
                        })
                      }
                      placeholder="Describe the issue"
                    />

                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    style={{
                      borderRadius: 14,
                      padding: 12
                    }}
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Ticket"}
                  </button>

                </form>

              </div>

            </div>

          </div>

          {/* TICKETS */}
          <div className="col-lg-7">

            <div
              className="card border-0 shadow-sm"
              style={{ borderRadius: 20 }}
            >

              <div className="p-4">

                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                  <div>

                    <h4 className="fw-bold mb-1">
                      My Tickets
                    </h4>

                    <p className="text-muted mb-0">
                      Track all your support tickets
                    </p>

                  </div>

                  <div className="d-flex gap-2 flex-wrap">

                    <select
                      className="form-select"
                      style={{
                        width: 160,
                        borderRadius: 14
                      }}
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          status: e.target.value
                        })
                      }
                    >
                      <option value="">
                        All Status
                      </option>

                      <option value="open">
                        Open
                      </option>

                      <option value="pending">
                        Pending
                      </option>

                      <option value="resolved">
                        Resolved
                      </option>

                    </select>

                    <input
                      type="text"
                      className="form-control"
                      style={{
                        width: 240,
                        borderRadius: 14
                      }}
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          search: e.target.value
                        })
                      }
                      placeholder="Search ticket"
                    />

                  </div>

                </div>

              </div>

              <div className="table-responsive">

                <table className="table align-middle mb-0">

                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Subject</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Reply</th>
                    </tr>
                  </thead>

                  <tbody>

                    {loading ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-5"
                        >
                          Loading...
                        </td>
                      </tr>
                    ) : filteredTickets.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-5"
                        >
                          No tickets found
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map((t) => (
                        <tr key={t.id}>

                          <td className="fw-semibold">
                            {t.ticket_code}
                          </td>

                          <td>
                            {t.subject}
                          </td>

                          <td>
                            {t.issue_type}
                          </td>

                          <td>
                            <StatusBadge status={t.status} />
                          </td>

                          <td>
                            {t.admin_reply || "-"}
                          </td>

                        </tr>
                      ))
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default SupportCenter;