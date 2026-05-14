import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function StatusBadge({ status }) {
  const cfg = {
    open: { className: "bg-warning text-dark", label: "Open" },
    pending: { className: "bg-info text-dark", label: "Pending" },
    resolved: { className: "bg-success", label: "Resolved" }
  };
  const c = cfg[status] || { className: "bg-secondary", label: status };
  return <span className={`badge rounded-pill ${c.className}`}>{c.label}</span>;
}

function AdminSupport() {
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: "",
    search: "",
    page: 1,
    limit: 10
  });

  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 1 });

  const issueStatuses = useMemo(() => ["open", "pending", "resolved"], []);

  const [replyDrafts, setReplyDrafts] = useState({});
  const [statusDrafts, setStatusDrafts] = useState({});

  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  };

  const fetchAllTickets = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit
      };
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const res = await API.get("/support/tickets", { params });

      setTickets(res.data.tickets || []);
      setPagination({
        total: res.data.total || 0,
        total_pages: res.data.total_pages || 1
      });
    } catch (error) {
      showToast("danger", error?.response?.data?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.search, filters.page, filters.limit]);

  const handleReply = async (ticketId) => {
    const admin_reply = (replyDrafts[ticketId] || "").trim();
    const status = statusDrafts[ticketId] || "";

    if (!admin_reply) {
      showToast("warning", "Enter a reply before saving");
      return;
    }

    try {
      await API.post(`/support/tickets/${ticketId}/reply`, { admin_reply, status: status || undefined });
      showToast("success", "Reply saved");
      // refresh
      fetchAllTickets();
    } catch (error) {
      showToast("danger", error?.response?.data?.message || "Failed to save reply");
    }
  };

  const handleStatusUpdate = async (ticketId) => {
    const status = statusDrafts[ticketId];
    if (!status) {
      showToast("warning", "Choose a status");
      return;
    }

    try {
      await API.put(`/support/tickets/${ticketId}/status`, { status });
      showToast("success", "Status updated");
      fetchAllTickets();
    } catch (error) {
      showToast("danger", error?.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fc" }}>
      <div
        className="py-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(13,110,253,.12), rgba(139,92,246,.10), rgba(6,182,212,.10))",
          borderBottom: "1px solid rgba(0,0,0,.04)"
        }}
      >
        <div className="container">
          <h2 className="fw-bold mb-1">Support Tickets</h2>
          <p className="mb-0 text-muted">Reply, update status, and resolve issues.</p>
        </div>
      </div>

      <div className="container py-4">
        {toast.show && (
          <div
            className={`alert alert-${toast.type} shadow-sm border-0 d-flex align-items-center justify-content-between mb-4`}
            role="alert"
          >
            <div>{toast.message}</div>
            <button className="btn btn-sm btn-close" onClick={() => setToast((t) => ({ ...t, show: false }))} />
          </div>
        )}

        <div className="card border-0 shadow-sm" style={{ borderRadius: 20 }}>
          <div className="p-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h4 className="fw-bold mb-1">All Tickets</h4>
              <p className="mb-0 text-muted">Use filters to find specific tickets quickly.</p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <select
                className="form-select"
                style={{ borderRadius: 14, width: 180 }}
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>

              <input
                className="form-control"
                style={{ borderRadius: 14, width: 280 }}
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
                placeholder="Search by code / subject"
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ fontSize: ".95rem" }}>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>User</th>
                  <th>Booking</th>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Reply / Resolve</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      <div className="spinner-border text-primary" />
                      <div className="text-muted mt-2">Loading tickets...</div>
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="text-center py-5">
                        <div className="display-6">🛠️</div>
                        <h5 className="fw-bold mt-2">No tickets found</h5>
                        <p className="text-muted mb-0">Try different filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <div className="fw-semibold">{t.ticket_code}</div>
                        <div className="text-muted" style={{ fontSize: ".85rem" }}>
                          {t.created_at ? new Date(t.created_at).toLocaleString() : ""}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold">{t.user_name || "User"}</div>
                        <div className="text-muted" style={{ fontSize: ".85rem" }}>{t.user_email || ""}</div>
                      </td>
                      <td>
                        <span className="text-muted">{t.booking_code || "—"}</span>
                      </td>
                      <td style={{ maxWidth: 260 }}>
                        <div className="fw-semibold">{t.subject}</div>
                        <div className="text-muted" style={{ fontSize: ".86rem" }}>
                          {String(t.message || "").slice(0, 90)}{String(t.message || "").length > 90 ? "..." : ""}
                        </div>
                      </td>
                      <td>{t.issue_type}</td>
                      <td>
                        <StatusBadge status={t.status} />
                      </td>
                      <td>
                        <div className="d-grid gap-2">
                          <textarea
                            className="form-control"
                            style={{ borderRadius: 14, minHeight: 70, resize: "vertical" }}
                            value={replyDrafts[t.id] || ""}
                            onChange={(e) =>
                              setReplyDrafts((d) => ({ ...d, [t.id]: e.target.value }))
                            }
                            placeholder="Write reply..."
                          />

                          <div className="d-flex gap-2">
                            <select
                              className="form-select"
                              style={{ borderRadius: 14 }}
                              value={statusDrafts[t.id] || ""}
                              onChange={(e) => setStatusDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
                            >
                              <option value="">Keep status</option>
                              {issueStatuses.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <button
                              className="btn btn-outline-primary"
                              style={{ borderRadius: 14, whiteSpace: "nowrap" }}
                              onClick={() => handleReply(t.id)}
                            >
                              Save
                            </button>
                          </div>

                          <div className="d-flex gap-2">
                            <select
                              className="form-select"
                              style={{ borderRadius: 14 }}
                              value={statusDrafts[t.id] || ""}
                              onChange={(e) => setStatusDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
                            >
                              <option value="">Update status...</option>
                              {issueStatuses.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <button
                              className="btn btn-primary"
                              style={{ borderRadius: 14, whiteSpace: "nowrap" }}
                              onClick={() => handleStatusUpdate(t.id)}
                            >
                              Resolve
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && tickets.length > 0 && (
            <div className="p-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div className="text-muted" style={{ fontSize: ".9rem" }}>
                Page <strong>{filters.page}</strong> of <strong>{pagination.total_pages}</strong>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-primary"
                  style={{ borderRadius: 14 }}
                  disabled={filters.page <= 1}
                  onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))}
                >
                  Prev
                </button>
                <button
                  className="btn btn-outline-primary"
                  style={{ borderRadius: 14 }}
                  disabled={filters.page >= pagination.total_pages}
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: Math.min(pagination.total_pages, f.page + 1) }))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSupport;

