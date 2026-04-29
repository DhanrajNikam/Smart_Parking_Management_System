import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isRegister) {
        await API.post("/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role
        });

        alert("Registration successful! Please login.");
        setIsRegister(false);
      } else {
        const res = await API.post("/auth/login", {
          email: form.email,
          password: form.password
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0d6efd, #3b82f6, #93c5fd)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px"
      }}
    >
      <div
        className="card border-0 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "450px",
          borderRadius: "22px",
          overflow: "hidden"
        }}
      >
        {/* Top Header */}

        <div
          style={{
            background: "#0d6efd",
            color: "white",
            padding: "30px",
            textAlign: "center"
          }}
        >
          <h2 className="fw-bold mb-2">
            🚗 ParkSmart
          </h2>

          <p className="mb-0">
            Smart Parking Management System
          </p>
        </div>

        {/* Form Section */}

        <div className="p-4">

          <h3 className="text-center fw-bold mb-4">
            {isRegister
              ? "Create Account"
              : isAdmin
              ? "Admin Login"
              : "User Login"}
          </h3>

          <div className="text-center mb-3">
            <Link to="/" className="text-decoration-none fw-semibold" style={{ color: "#0d6efd" }}>
              ← Back to Home
            </Link>
          </div>

          <form onSubmit={handleSubmit}>

            {isRegister && (
              <div className="mb-3">
                <label className="fw-semibold">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={{
                    borderRadius: "12px",
                    padding: "12px"
                  }}
                />
              </div>
            )}

            <div className="mb-3">
              <label className="fw-semibold">
                Email
              </label>

              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
                style={{
                  borderRadius: "12px",
                  padding: "12px"
                }}
              />
            </div>

            <div className="mb-3">
              <label className="fw-semibold">
                Password
              </label>

              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
                style={{
                  borderRadius: "12px",
                  padding: "12px"
                }}
              />
            </div>

            {isRegister && (
              <div className="mb-4">
                <label className="fw-semibold">
                  Role
                </label>

                <select
                  name="role"
                  className="form-control"
                  value={form.role}
                  onChange={handleChange}
                  style={{
                    borderRadius: "12px",
                    padding: "12px"
                  }}
                >
                  <option value="user">
                    User
                  </option>

                  <option value="admin">
                    Admin
                  </option>
                </select>
              </div>
            )}

            <button
              className="btn btn-primary w-100 fw-bold"
              style={{
                borderRadius: "14px",
                padding: "12px",
                fontSize: "16px"
              }}
            >
              {isRegister ? "Register" : "Login"}
            </button>

          </form>

          {/* Bottom Actions */}

          <div className="text-center mt-4">

            {!isRegister ? (
              <>
                <p className="mb-2">
                  Don’t have an account?{" "}
                  <button
                    className="btn btn-link p-0 fw-bold"
                    onClick={() => setIsRegister(true)}
                  >
                    Register
                  </button>
                </p>

                <button
                  className="btn btn-link text-muted p-0"
                  onClick={() => setIsAdmin(!isAdmin)}
                >
                  {isAdmin
                    ? "Switch to User Login"
                    : "Admin Login"}
                </button>
              </>
            ) : (
              <p className="mb-0">
                Already have an account?{" "}
                <button
                  className="btn btn-link p-0 fw-bold"
                  onClick={() => setIsRegister(false)}
                >
                  Login
                </button>
              </p>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;