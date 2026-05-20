import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { motion } from "framer-motion";
import {
  FaCarSide,
  FaShieldAlt,
  FaUser,
  FaLock,
  FaEnvelope,
  FaPhoneAlt,
  FaUserShield,
  FaCity,
} from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    phone_number: "",
  });

  const bgUrl = useMemo(() => {
    // Fullscreen parking background image (SVG in public if exists; fallback to current).
    // Requirement: inline CSS only.
    return "url('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=2070&auto=format&fit=crop')";
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validateClientSide = () => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      form.email.trim()
    );
    const phoneOk = form.phone_number.trim().length === 10;
    const passwordOk = form.password.length >= 4;

    if (isRegister) {
      if (!form.name.trim()) return "Full name is required";
      if (!emailOk) return "Please enter a valid email";
      if (!phoneOk)
        return "Please enter a valid 10-digit mobile number";
      if (!passwordOk) return "Password must be at least 4 characters";
    } else {
      if (!emailOk) return "Please enter a valid email";
      if (!passwordOk) return "Password must be at least 4 characters";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validateClientSide();
    if (err) {
      alert(err);
      return;
    }

    try {
      if (isRegister) {
        await API.post("/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          phone_number: `+91${form.phone_number}`,
        });

        alert("Registration successful!");
        setIsRegister(false);
      } else {
        const res = await API.post("/auth/login", {
          email: form.email,
          password: form.password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        alert("Login Successful");

        if (res.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  const glassCardStyle = {
    width: "100%",
    maxWidth: 450,
    borderRadius: 30,
    overflow: "hidden",
    position: "relative",
    zIndex: 2,
    backdropFilter: "blur(18px)",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.22)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  };

  const headerStyle = {
    padding: "26px 22px 18px",
    textAlign: "center",
    color: "white",
    background: "linear-gradient(135deg,#0b5fff,#2563eb,#06b6d4)",
    position: "relative",
  };

  const bodyStyle = {
    padding: "26px 22px 22px",
    background: "rgba(255,255,255,0.92)",
  };

  const labelStyle = {
    fontWeight: 800,
    color: "#0f172a",
    fontSize: 13,
    marginBottom: 8,
    letterSpacing: 0.2,
  };

  const inputShell = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.92)",
    transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
  };

  const inputStyle = {
    border: "none",
    outline: "none",
    flex: 1,
    fontSize: 14,
    background: "transparent",
    color: "#0f172a",
  };

  const iconStyle = {
    color: "#2563eb",
    fontSize: 16,
    opacity: 0.95,
  };

  const ctaStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 18,
    border: "none",
    fontWeight: 900,
    fontSize: 16,
    color: "white",
    background: "linear-gradient(135deg,#2563eb,#06b6d4)",
    boxShadow: "0 10px 25px rgba(37,99,235,0.35)",
    transition: "transform 160ms ease, filter 160ms ease, box-shadow 160ms ease",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 18,
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: bgUrl,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay with blue gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(140deg, rgba(0,0,0,0.70) 12%, rgba(9,78,255,0.42) 55%, rgba(6,182,212,0.38) 100%)",
          zIndex: 0,
        }}
      />

      {/* Floating blur circles */}
      <div
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          background: "#2563eb",
          borderRadius: "50%",
          top: "8%",
          left: "6%",
          filter: "blur(120px)",
          opacity: 0.34,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          background: "#06b6d4",
          borderRadius: "50%",
          top: "-5%",
          right: "-8%",
          filter: "blur(120px)",
          opacity: 0.22,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          background: "#60a5fa",
          borderRadius: "50%",
          bottom: "10%",
          right: "10%",
          filter: "blur(120px)",
          opacity: 0.20,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Gradient animated background */}
      <div
        style={{
          position: "absolute",
          inset: -40,
          zIndex: 0,
          background:
            "radial-gradient(circle at 20% 20%, rgba(37,99,235,0.40), transparent 55%), radial-gradient(circle at 80% 10%, rgba(6,182,212,0.30), transparent 60%), radial-gradient(circle at 60% 85%, rgba(59,130,246,0.25), transparent 55%)",
          animation: "psGlow 8s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <style>{`
        @keyframes psGlow {
          0% { transform: translate3d(0,0,0) scale(1); filter: hue-rotate(0deg); }
          50% { transform: translate3d(0,-7px,0) scale(1.02); filter: hue-rotate(14deg); }
          100% { transform: translate3d(0,0,0) scale(1); filter: hue-rotate(0deg); }
        }
        .ps-input:hover { transform: translateY(-1px); }
        .ps-input:focus-within {
          border-color: rgba(37, 99, 235, 0.35) !important;
          box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.14) !important;
          transform: translateY(-1px);
        }
        .ps-btn:hover {
          transform: translateY(-1px) scale(1.02);
          filter: brightness(1.05);
          box-shadow: 0 0 0 4px rgba(37,99,235,0.18), 0 18px 45px rgba(37,99,235,0.50);
        }
        .ps-btn:active { transform: translateY(0) scale(1); }
        .ps-title { font-weight: 900; letter-spacing: 0.6px; }
        @media (max-width: 576px) {
          /* Mobile spacing tuning */
          .ps-card { max-width: 460px !important; }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={glassCardStyle}
        className="ps-card"
      >
        <div style={headerStyle}>
          <div
            style={{
              width: 76,
              height: 76,
              margin: "0 auto 12px",
              borderRadius: 22,
              background: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 14px 35px rgba(0,0,0,0.22), inset 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            <FaCarSide size={30} />
          </div>

          <h1 className="ps-title" style={{ margin: 0, fontSize: 26 }}>
            ParkSmart
          </h1>
          <p style={{ margin: "6px 0 0", opacity: 0.96, fontSize: 13 }}>
            Smart Parking Management System
          </p>
        </div>

        <div style={bodyStyle}>
          <div className="text-center mb-3">
            <Link
              to="/"
              style={{
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: 900,
                fontSize: 13,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 16, transform: "translateY(-1px)" }}>
                ←
              </span>
              Back to Home
            </Link>
          </div>

          <h2
            style={{
              textAlign: "center",
              fontWeight: 900,
              marginBottom: 18,
              color: "#0f172a",
              fontSize: 20,
            }}
          >
            {isRegister ? "Create Account" : isAdmin ? "Admin Login" : "User Login"}
          </h2>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="mb-3">
                <div style={labelStyle}>Full Name</div>
                <div className="ps-input" style={inputShell}>
                  <FaUser style={iconStyle} />
                  <input
                    type="text"
                    name="name"
                    className="form-control p-0"
                    placeholder="Enter full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <div className="mb-3">
                <div style={labelStyle}>Mobile Number</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div
                    className="ps-input"
                    style={{
                      ...inputShell,
                      width: 78,
                      justifyContent: "center",
                      padding: "12px 0",
                      background: "rgba(15,23,42,0.03)",
                    }}
                  >
                    <span style={{ fontWeight: 1000, color: "#0f172a" }}>+91</span>
                  </div>
                  <div className="ps-input" style={{ ...inputShell, flex: 1 }}>
                    <FaPhoneAlt style={iconStyle} />
                    <input
                      type="tel"
                      name="phone_number"
                      className="form-control p-0"
                      placeholder="10-digit mobile"
                      value={form.phone_number}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          phone_number: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10),
                        })
                      }
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mb-3">
              <div style={labelStyle}>Email</div>
              <div className="ps-input" style={inputShell}>
                <FaEnvelope style={iconStyle} />
                <input
                  type="email"
                  name="email"
                  className="form-control p-0"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="mb-2">
              <div style={labelStyle}>Password</div>
              <div className="ps-input" style={inputShell}>
                <FaLock style={iconStyle} />
                <input
                  type="password"
                  name="password"
                  className="form-control p-0"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            {isRegister && (
              <div className="mb-4" style={{ marginTop: 14 }}>
                <div style={labelStyle}>Role</div>
                <div className="ps-input" style={{ ...inputShell, padding: "0 14px" }}>
                  <FaCity style={iconStyle} />
                  <select
                    name="role"
                    className="form-select border-0"
                    value={form.role}
                    onChange={handleChange}
                    style={{
                      ...inputStyle,
                      padding: "12px 0",
                      appearance: "none",
                      background: "transparent",
                      fontWeight: 800,
                    }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            )}

            {!isRegister && (
              <div className="d-flex justify-content-end mb-3">
                <Link
                  to="/forgot-password"
                  style={{
                    textDecoration: "none",
                    color: "#2563eb",
                    fontWeight: 900,
                    fontSize: 13,
                  }}
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            <button type="submit" className="ps-btn btn" style={ctaStyle}>
              {isRegister ? "Register" : "Login"}
            </button>
          </form>

          <div className="text-center mt-4">
            {!isRegister ? (
              <>
                <div style={{ color: "#334155", fontWeight: 800, fontSize: 14 }}>
                  Don’t have an account?
                  <button
                    className="btn btn-link p-0 fw-bold"
                    style={{ textDecoration: "none", marginLeft: 6, color: "#2563eb" }}
                    onClick={() => setIsRegister(true)}
                  >
                    Register
                  </button>
                </div>

                <div className="mt-2">
                  <button
                    className="btn btn-link p-0"
                    style={{
                      color: "#64748b",
                      textDecoration: "none",
                      fontWeight: 900,
                      fontSize: 14,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                    onClick={() => setIsAdmin(!isAdmin)}
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 10,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(37,99,235,0.10)",
                        border: "1px solid rgba(37,99,235,0.25)",
                      }}
                    >
                      {isAdmin ? <FaShieldAlt size={13} /> : <FaUserShield size={13} />}
                    </span>
                    {isAdmin ? "Switch to User Login" : "Admin Login"}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ color: "#334155", fontWeight: 800, fontSize: 14 }}>
                Already have an account?
                <button
                  className="btn btn-link p-0 fw-bold"
                  style={{
                    textDecoration: "none",
                    marginLeft: 6,
                    color: "#2563eb",
                  }}
                  onClick={() => setIsRegister(false)}
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;

