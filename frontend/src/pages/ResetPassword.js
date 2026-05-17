import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const canSubmit = useMemo(() => {
    return (
      token &&
      newPassword.length >= 6 &&
      newPassword === confirmPassword
    );
  }, [token, newPassword, confirmPassword]);

  useEffect(() => {
    setAlert({ type: "", message: "" });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });

    if (!token) {
      setAlert({ type: "danger", message: "Missing reset token" });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setAlert({ type: "danger", message: "Password must be at least 6 characters" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlert({ type: "danger", message: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/reset-password", {
        token,
        newPassword,
      });

      setAlert({ type: "success", message: res.data.message });
      setTimeout(() => {
        navigate("/login");
      }, 1400);
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
          maxWidth: "520px",
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
          <h3 className="fw-bold mb-1">🔐 Choose New Password</h3>
          <p className="mb-0" style={{ opacity: 0.95 }}>
            Token expires in 10 minutes
          </p>
        </div>

        <div className="p-4">
          <div className="text-center mb-3">
            <button
              className="btn btn-link text-decoration-none fw-semibold"
              onClick={() => navigate("/login")}
              type="button"
            >
              ← Back to Login
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {alert.message && (
              <div
                className={`alert alert-${alert.type}`}
                role="alert"
                style={{ borderRadius: "14px", animation: "fadeIn 0.25s ease-in-out" }}
              >
                {alert.message}
              </div>
            )}

            <div className="mb-3">
              <label className="fw-semibold">New Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ borderRadius: "12px 0 0 12px", padding: "12px" }}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ borderRadius: "0 12px 12px 0" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="text-muted" style={{ fontSize: 13, marginTop: 6 }}>
                Minimum 6 characters
              </div>
            </div>

            <div className="mb-4">
              <label className="fw-semibold">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ borderRadius: "12px", padding: "12px" }}
              />
            </div>

            <button
              className="btn btn-primary w-100 fw-bold"
              type="submit"
              disabled={loading || !canSubmit}
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
                  Updating...
                </>
              ) : (
                "Reset Password"
              )}
            </button>

            <div className="text-center text-muted mt-3" style={{ fontSize: 13 }}>
              After success, you’ll be redirected to login.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

