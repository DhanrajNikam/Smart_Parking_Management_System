import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function WalletHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTx = async () => {
    try {
      setLoading(true);
      const res = await API.get("/wallet/transactions?limit=100");
      setRows(res.data || []);
    } catch (err) {
      console.log("fetchTx error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const badgeClass = (type) => {
    if (type === "credit") return "bg-success";
    if (type === "debit") return "bg-danger";
    return "bg-secondary";
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h3 className="mb-3">Wallet Transaction History</h3>

        {loading ? (
          <div className="spinner-border" role="status" />
        ) : rows.length === 0 ? (
          <p className="text-muted">No transactions yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Booking ID</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.booking_id || "-"}</td>
                    <td>₹{Number(r.amount || 0).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${badgeClass(r.type)}`}>{r.type}</span>
                    </td>
                    <td style={{ maxWidth: 320 }}>
                      {r.description}
                    </td>
                    <td>
                      {r.created_at ? new Date(r.created_at).toLocaleString("en-IN") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletHistory;

