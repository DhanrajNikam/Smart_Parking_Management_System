import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function Wallet() {
  const [wallet, setWallet] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await API.get("/wallet/balance");
      setWallet(Number(res.data.wallet || 0));
    } catch (err) {
      console.log("fetchWallet error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <div className="row g-3">
          <div className="col-md-7">
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="mb-1">Wallet Balance</h4>
                <p className="text-muted mb-3">Available refund wallet</p>
                {loading ? (
                  <div className="spinner-border" role="status" />
                ) : (
                  <h2 className="mb-0">₹{wallet.toFixed(2)}</h2>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-5">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="mb-3">Refund Options</h5>
                <Link to="/refund/request" className="btn btn-primary w-100 mb-2">
                  Request Refund
                </Link>
                <Link to="/wallet/transactions" className="btn btn-outline-primary w-100">
                  View Wallet History
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Wallet;

