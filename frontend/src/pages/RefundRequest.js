import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function RefundRequest() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(0);

  const [amount, setAmount] = useState(0);
  const [payment_method, setPaymentMethod] = useState("upi");
  const [upi_id, setUpiId] = useState("");
  const [account_number, setAccountNumber] = useState("");
  const [ifsc_code, setIfscCode] = useState("");

  const [loading, setLoading] = useState(false);

  const fetchWallet = async () => {
    try {
      const res = await API.get("/wallet/balance");
      setWallet(Number(res.data.wallet || 0));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }
    if (Number(amount) > wallet) {
      alert("Amount cannot exceed wallet balance");
      return;
    }
    if (payment_method === "upi" && !upi_id.trim()) {
      alert("Enter UPI ID");
      return;
    }
    if (payment_method === "bank" && (!account_number.trim() || !ifsc_code.trim())) {
      alert("Enter account number and IFSC");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount: Number(amount),
        payment_method,
        upi_id: payment_method === "upi" ? upi_id.trim() : null,
        account_number: payment_method === "bank" ? account_number.trim() : null,
        ifsc_code: payment_method === "bank" ? ifsc_code.trim() : null
      };

      const res = await API.post("/wallet/refund/request", payload);
      alert(res.data?.message || "Refund request submitted");
      navigate("/wallet/transactions");
    } catch (err) {
      alert(err.response?.data?.message || "Refund request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3">
              <div>
                <h3 className="mb-0">Refund Request</h3>
                <p className="text-muted mb-0">Wallet balance: ₹{wallet.toFixed(2)}</p>
              </div>
              <button className="btn btn-outline-secondary" onClick={() => navigate("/wallet")}>Back</button>
            </div>

            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-select"
                  value={payment_method}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              {payment_method === "upi" ? (
                <div className="mb-3">
                  <label className="form-label">UPI ID</label>
                  <input
                    className="form-control"
                    value={upi_id}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="name@bank"
                  />
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="form-label">Account Number</label>
                    <input
                      className="form-control"
                      value={account_number}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">IFSC Code</label>
                    <input
                      className="form-control"
                      value={ifsc_code}
                      onChange={(e) => setIfscCode(e.target.value)}
                    />
                  </div>
                </>
              )}

              <button className="btn btn-primary" disabled={loading} type="submit">
                {loading ? "Submitting..." : "Submit Refund Request"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RefundRequest;

