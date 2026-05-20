import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaCalendarCheck,
  FaCreditCard,
  FaBell,
  FaCar,
  FaSearch,
  FaParking,
  FaStar,
  FaArrowRight,
  FaShieldAlt,
  FaBolt,
} from "react-icons/fa";

const tokens = `
:root{
  --ps-ink:#0f172a;
  --ps-muted:#64748b;
  --ps-border:#e6e8ef;

  --ps-primary:#6366f1;
  --ps-primary-2:#8b5cf6;
  --ps-accent:#06b6d4;
  --ps-success:#10b981;

  --ps-gradient:
    linear-gradient(
      135deg,
      #6366f1 0%,
      #8b5cf6 50%,
      #06b6d4 100%
    );

  --ps-shadow:
    0 25px 70px -20px rgba(99,102,241,.35);
}

body{
  font-family:'Inter',sans-serif;
  color:var(--ps-ink);
  background:#fff;
}

.ps-display{
  font-family:'Space Grotesk',sans-serif;
  letter-spacing:-2px;
}

.ps-gradient-text{
  background:var(--ps-gradient);
  -webkit-background-clip:text;
  color:transparent;
}

.ps-glass{
  background:rgba(255,255,255,.82);
  backdrop-filter:blur(18px);
  border-bottom:1px solid rgba(15,23,42,.06);
}

.ps-nav-link{
  text-decoration:none;
  color:#0f172a;
  font-weight:500;
  opacity:.75;
  transition:.3s;
}

.ps-nav-link:hover{
  opacity:1;
}

.ps-btn-primary{
  background:
  linear-gradient(
    135deg,
    #6366f1,
    #8b5cf6
  );

  color:#fff;
  border:none;
  border-radius:18px;

  box-shadow:
  0 20px 40px rgba(99,102,241,.25);

  transition:.3s;
}

.ps-btn-primary:hover{
  transform:translateY(-2px);
  color:#fff;
}

.ps-btn-light{
  background:#fff;
  border:1px solid #e2e8f0;
  border-radius:18px;
  transition:.3s;
}

.ps-btn-light:hover{
  transform:translateY(-2px);
}

.ps-card{
  background:#fff;
  border:1px solid var(--ps-border);
  border-radius:24px;
  transition:.3s;
}

.ps-card:hover{
  transform:translateY(-6px);
  box-shadow:var(--ps-shadow);
}

.ps-icon-tile{
  width:60px;
  height:60px;
  border-radius:18px;
  background:var(--ps-gradient);
  color:#fff;

  display:flex;
  align-items:center;
  justify-content:center;

  font-size:1.5rem;
}

.ps-step{
  width:90px;
  height:90px;
  border-radius:50%;
  background:var(--ps-gradient);

  display:flex;
  align-items:center;
  justify-content:center;

  color:#fff;
  font-size:2rem;

  margin:auto;

  box-shadow:var(--ps-shadow);
}

.ps-pill{
  display:inline-flex;
  align-items:center;
  gap:.5rem;

  padding:.5rem 1rem;

  border-radius:999px;

  background:#eef2ff;

  color:#4f46e5;

  font-size:.85rem;
  font-weight:600;
}

.ps-stat-num{
  font-size:2.5rem;
  font-weight:800;
  font-family:'Space Grotesk',sans-serif;
}

.ps-hero{
  position:relative;
  overflow:hidden;

  background:
  linear-gradient(
    135deg,
    #f5f7ff 0%,
    #eef2ff 40%,
    #ecfeff 100%
  );
}

.ps-footer{
  background:#0b1020;
  color:#cbd5e1;
}

.ps-fade-up{
  animation:fadeUp .8s ease both;
}

@keyframes fadeUp{
  from{
    opacity:0;
    transform:translateY(20px);
  }
  to{
    opacity:1;
    transform:none;
  }
}
`;

function HomePage() {
  return (
    <div>
      <style>{tokens}</style>

      {/* NAVBAR */}

      <nav className="ps-glass sticky-top">
        <div className="container d-flex align-items-center justify-content-between py-3">

          <Link
            to="/"
            className="d-flex align-items-center gap-2 text-decoration-none"
          >
            <span
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: "var(--ps-gradient)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--ps-shadow)",
              }}
            >
              <FaCar />
            </span>

            <span
              className="ps-display fw-bold fs-4"
              style={{ color: "#0f172a" }}
            >
              ParkSmart
            </span>
          </Link>

          <div className="d-none d-md-flex align-items-center gap-4">
            <a href="#features" className="ps-nav-link">
              Features
            </a>

            <a href="#dashboard" className="ps-nav-link">
              Dashboard
            </a>

            <a href="#admin" className="ps-nav-link">
              Admin
            </a>
          </div>

          <div className="d-flex gap-2">

            <Link
              to="/login"
              className="btn fw-semibold"
            >
              Login
            </Link>

            <Link
              to="/login"
              className="btn ps-btn-primary fw-semibold px-4 py-2"
            >
              Get Started
              <FaArrowRight className="ms-2" size={12} />
            </Link>

          </div>
        </div>
      </nav>

      {/* HERO */}

      <section className="ps-hero py-5">

        <div className="container py-5">

          <div className="row align-items-center g-5">

            {/* LEFT */}

            <div className="col-lg-6 ps-fade-up">

              <span className="ps-pill mb-4">
                <FaBolt />
                Trusted by 940+ drivers in Nashik
              </span>

              <h1
                className="ps-display fw-bold mb-4"
                style={{
                  fontSize: "5.5rem",
                  lineHeight: "0.95",
                  color: "#020617",
                }}
              >
                Smart parking,
                <br />

                <span className="ps-gradient-text">
                  simplified.
                </span>
              </h1>

              <p
                className="lead mb-4"
                style={{
                  color: "#64748b",
                  maxWidth: "560px",
                  fontSize: "1.25rem",
                }}
              >
                Stop circling the block. ParkSmart
                finds, books, and manages parking
                spots in real-time — so you arrive,
                park, and go.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-4">

                <Link
                  to="/login"
                  className="btn ps-btn-primary btn-lg fw-semibold px-4 py-3"
                >
                  Get Started Free
                  <FaArrowRight className="ms-2" />
                </Link>

                <button
                  className="btn ps-btn-light btn-lg fw-semibold px-4 py-3"
                >
                  Explore the Map
                </button>

              </div>

              <div className="d-flex align-items-center gap-3">

                <div
                  className="d-flex"
                  style={{
                    color: "#f59e0b",
                  }}
                >
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

                <div
                  style={{
                    color: "#64748b",
                  }}
                >
                  <strong style={{ color: "#0f172a" }}>
                    4.9
                  </strong>{" "}
                  from 1,200+ reviews
                </div>

              </div>
            </div>

            {/* RIGHT */}

            <div className="col-lg-6 ps-fade-up">

              <div
                style={{
                  position: "relative",
                  borderRadius: "36px",
                  overflow: "hidden",

                  boxShadow:
                    "0 30px 80px -20px rgba(0,0,0,.25)",
                }}
              >

                <img
                  src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1883&auto=format&fit=crop"
                  alt="car"
                  style={{
                    width: "100%",
                    height: "520px",
                    objectFit: "cover",
                    borderRadius: "36px",
                  }}
                />

                {/* FLOATING CARD */}

                <div
                  style={{
                    position: "absolute",
                    bottom: "-25px",
                    left: "-20px",

                    width: "250px",

                    padding: "22px",

                    borderRadius: "28px",

                    background:
                      "rgba(255,255,255,.72)",

                    backdropFilter: "blur(18px)",

                    boxShadow:
                      "0 20px 60px rgba(0,0,0,.15)",
                  }}
                >

                  <div
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    Nearest available
                  </div>

                  <h5
                    className="fw-bold mt-2 mb-2"
                  >
                    Tech Park Garage
                  </h5>

                  <div
                    style={{
                      color: "#10b981",
                      fontWeight: "600",
                    }}
                  >
                    84 slots open • ₹30/hr
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}

      <section
        style={{
          background: "#fff",
          borderBottom:
            "1px solid var(--ps-border)",
        }}
      >

        <div className="container py-5">

          <div className="row text-center g-4">

            {[
              {
                v: "320+",
                l: "Live Slots",
              },
              {
                v: "1,284",
                l: "Bookings",
              },
              {
                v: "₹4.8L",
                l: "Saved in Fuel",
              },
              {
                v: "4.9★",
                l: "Driver Rating",
              },
            ].map((s, i) => (

              <div
                key={i}
                className="col-6 col-md-3"
              >

                <div className="ps-stat-num ps-gradient-text">
                  {s.v}
                </div>

                <div
                  style={{
                    color: "#64748b",
                    fontWeight: "600",
                  }}
                >
                  {s.l}
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}

      <section
        id="features"
        className="py-5"
        style={{
          background: "#fafbff",
        }}
      >

        <div className="container py-5">

          <div className="text-center mb-5">

            <span
              className="badge rounded-pill px-4 py-2 mb-3"
              style={{
                background:
                  "rgba(99,102,241,.1)",
                color: "#6366f1",
              }}
            >
              FEATURES
            </span>

            <h2 className="ps-display fw-bold display-5">
              Everything you need to park.
            </h2>

            <p
              className="lead"
              style={{
                color: "#64748b",
              }}
            >
              Built for drivers, lot owners,
              and city operators.
            </p>

          </div>

          <div className="row g-4">

            {[
              {
                icon: <FaSearch />,
                title: "Real-Time Search",
                desc: "Find parking instantly nearby.",
              },
              {
                icon: <FaCalendarCheck />,
                title: "Easy Booking",
                desc: "Book parking in seconds.",
              },
              {
                icon: <FaCreditCard />,
                title: "Secure Payments",
                desc: "Pay safely with UPI/cards.",
              },
              {
                icon: <FaBell />,
                title: "Smart Alerts",
                desc: "Get smart parking reminders.",
              },
            ].map((f, i) => (

              <div
                key={i}
                className="col-md-6 col-lg-3"
              >

                <div className="ps-card p-4 h-100">

                  <div className="ps-icon-tile mb-4">
                    {f.icon}
                  </div>

                  <h5 className="fw-bold">
                    {f.title}
                  </h5>

                  <p
                    style={{
                      color: "#64748b",
                    }}
                  >
                    {f.desc}
                  </p>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section className="py-5">

        <div className="container py-5">

          <div className="text-center mb-5">

            <span
              className="badge rounded-pill px-4 py-2 mb-3"
              style={{
                background:
                  "rgba(139,92,246,.1)",
                color: "#8b5cf6",
              }}
            >
              HOW IT WORKS
            </span>

            <h2 className="ps-display fw-bold display-5">
              Park in three simple steps.
            </h2>

          </div>

          <div className="row g-5 text-center">

            {[
              {
                icon: <FaMapMarkerAlt />,
                title: "1. Search Location",
                desc: "Find nearby parking spaces.",
              },
              {
                icon: <FaCar />,
                title: "2. Select & Book",
                desc: "Choose your preferred slot.",
              },
              {
                icon: <FaParking />,
                title: "3. Park & Go",
                desc: "Arrive and park hassle-free.",
              },
            ].map((s, i) => (

              <div
                key={i}
                className="col-md-4"
              >

                <div className="ps-step mb-4">
                  {s.icon}
                </div>

                <h5 className="fw-bold">
                  {s.title}
                </h5>

                <p
                  style={{
                    color: "#64748b",
                  }}
                >
                  {s.desc}
                </p>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="ps-footer py-5">

        <div className="container d-flex justify-content-between align-items-center flex-wrap">

          <div className="d-flex align-items-center gap-2">

            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background:
                  "var(--ps-gradient)",
                color: "#fff",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaCar />
            </span>

            <span className="fw-bold fs-5">
              ParkSmart
            </span>

          </div>

          <div
            style={{
              opacity: 0.7,
            }}
          >
            © {new Date().getFullYear()} ParkSmart
          </div>

        </div>
      </footer>
    </div>
  );
}

export default HomePage;