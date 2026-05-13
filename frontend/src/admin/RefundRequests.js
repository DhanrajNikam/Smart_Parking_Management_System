import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function RefundRequests() {

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {

    try {

      setLoading(true);

      const res = await API.get("/admin/refund-requests");

      setRows(res.data || []);

    } catch (e) {

      console.log(e);

      alert(
        e.response?.data?.message ||
        "Failed to load refund requests"
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchRequests();

    // eslint-disable-next-line
  }, []);

  const approveRefund = async (id) => {

    try {

      setLoading(true);

      await API.put(`/admin/refunds/${id}/approve`);

      alert("Refund approved successfully");

      fetchRequests();

    } catch (e) {

      console.log(e);

      alert(
        e.response?.data?.message ||
        "Approve failed"
      );

    } finally {

      setLoading(false);
    }
  };

  const rejectRefund = async (id) => {

    try {

      setLoading(true);

      await API.put(`/admin/refunds/${id}/reject`);

      alert("Refund rejected successfully");

      fetchRequests();

    } catch (e) {

      console.log(e);

      alert(
        e.response?.data?.message ||
        "Reject failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div>

      <Navbar />

      <div className="container mt-4">

        <h3 className="mb-3">
          Refund Requests (Admin)
        </h3>

        {loading ? (

          <div
            className="spinner-border"
            role="status"
          />

        ) : rows.length === 0 ? (

          <p className="text-muted">
            No refund requests found.
          </p>

        ) : (

          <div className="table-responsive">

            <table className="table table-bordered table-hover">

              <thead className="table-dark">

                <tr>
                  <th>ID</th>
                  <th>User ID</th>
                  <th>Booking ID</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>UPI/Account</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {rows.map((r) => (

                  <tr key={r.id}>

                    <td>{r.id}</td>

                    <td>{r.user_id}</td>

                    <td>{r.booking_id || "-"}</td>

                    <td>
                      ₹{Number(r.amount || 0).toFixed(2)}
                    </td>

                    <td>{r.payment_method}</td>

                    <td>
                      {r.payment_method === "upi"
                        ? r.upi_id
                        : `${r.account_number} (${r.ifsc_code})`}
                    </td>

                    <td>

                      <span
                        className={`badge ${
                          r.status === "approved"
                            ? "bg-success"
                            : r.status === "rejected"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {r.status}
                      </span>

                    </td>

                    <td>

                      {r.status === "pending" ? (

                        <div className="d-flex gap-2 flex-wrap">

                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => approveRefund(r.id)}
                          >
                            Approve
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => rejectRefund(r.id)}
                          >
                            Reject
                          </button>

                        </div>

                      ) : (

                        <span className="text-muted">
                          -
                        </span>

                      )}

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

export default RefundRequests;