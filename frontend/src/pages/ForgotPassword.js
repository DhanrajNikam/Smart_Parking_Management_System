import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setAlert({ type: "danger", message: "Email is required" });
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", {
        email: trimmedEmail,
      });

      setAlert({ type: "success", message: res.data.message });
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      setAlert({
        type: "danger",
        message: error.response?.data?.message || "Operation failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgba(13,110,253,1), rgba(59,130,246,1), rgba(147,197,253,1))",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        className="card border-0 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "480px",
          borderRadius: "22px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "#0d6efd",
            color: "white",
            padding: "28px",
            textAlign: "center",
          }}
        >
          <h3 className="fw-bold mb-1">🛡️ Reset Password</h3>
          <p className="mb-0" style={{ opacity: 0.95 }}>
            Enter your registered email
          </p>
        </div>

        <div className="p-4">
          <div className="text-center mb-3">
            <button
              className="btn btn-link text-decoration-none fw-semibold"
              onClick={() => navigate("/login")}
            >
              ← Back to Login
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="fw-semibold">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ borderRadius: "12px", padding: "12px" }}
              />
            </div>

            {alert.message && (
              <div
                className={`alert alert-${alert.type} animated fadeIn`}
                role="alert"
                style={{ borderRadius: "14px" }}
              >
                {alert.message}
              </div>
            )}

            <button
              className="btn btn-primary w-100 fw-bold"
              type="submit"
              disabled={loading}
              style={{
                borderRadius: "14px",
                padding: "12px",
                fontSize: "16px",
              }}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: 13 }}>
              For security, if the email exists you’ll receive a reset token.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

