import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaCalendarCheck, FaCreditCard, FaBell, FaCar, FaSearch, FaParking } from "react-icons/fa";

function HomePage() {
  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: "#0d6efd" }}>
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            🚗 ParkSmart
          </Link>
          <div className="d-flex gap-2">
            <Link className="btn btn-outline-light btn-sm" to="/login">
              Login
            </Link>
            <Link className="btn btn-light btn-sm fw-bold" to="/login">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          minHeight: "90vh",
          background: "linear-gradient(135deg, #0d6efd, #3b82f6, #93c5fd)",
          display: "flex",
          alignItems: "center",
          color: "white",
          padding: "60px 20px"
        }}
      >
        <div className="container text-center">
          <h1 className="display-3 fw-bold mb-4">
            Smart Parking, Simplified.
          </h1>
          <p className="lead mb-5" style={{ maxWidth: "700px", margin: "0 auto" }}>
            Find, book, and manage parking spots in real-time. No more circling the block — ParkSmart gets you parked faster.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link
              to="/login"
              className="btn btn-light btn-lg fw-bold px-5"
              style={{ borderRadius: "14px" }}
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="btn btn-outline-light btn-lg fw-bold px-5"
              style={{ borderRadius: "14px" }}
            >
              Explore Map
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">Why Choose ParkSmart?</h2>
          <div className="row g-4">
            <div className="col-md-3 col-sm-6">
              <div className="card h-100 border-0 shadow-sm text-center p-4" style={{ borderRadius: "18px" }}>
                <div className="mb-3" style={{ fontSize: "2.5rem", color: "#0d6efd" }}>
                  <FaSearch />
                </div>
                <h5 className="fw-bold">Real-Time Search</h5>
                <p className="text-muted mb-0">Find available parking spots near you instantly with live updates.</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="card h-100 border-0 shadow-sm text-center p-4" style={{ borderRadius: "18px" }}>
                <div className="mb-3" style={{ fontSize: "2.5rem", color: "#0d6efd" }}>
                  <FaCalendarCheck />
                </div>
                <h5 className="fw-bold">Easy Booking</h5>
                <p className="text-muted mb-0">Reserve your spot in seconds and guarantee your parking space.</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="card h-100 border-0 shadow-sm text-center p-4" style={{ borderRadius: "18px" }}>
                <div className="mb-3" style={{ fontSize: "2.5rem", color: "#0d6efd" }}>
                  <FaCreditCard />
                </div>
                <h5 className="fw-bold">Secure Payments</h5>
                <p className="text-muted mb-0">Pay safely online with multiple payment options and instant confirmation.</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="card h-100 border-0 shadow-sm text-center p-4" style={{ borderRadius: "18px" }}>
                <div className="mb-3" style={{ fontSize: "2.5rem", color: "#0d6efd" }}>
                  <FaBell />
                </div>
                <h5 className="fw-bold">Instant Alerts</h5>
                <p className="text-muted mb-0">Get notified about bookings, reminders, and parking updates.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">How It Works</h2>
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="p-4">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "#0d6efd",
                    color: "white",
                    borderRadius: "50%",
                    fontSize: "2rem"
                  }}
                >
                  <FaMapMarkerAlt />
                </div>
                <h5 className="fw-bold">1. Search Location</h5>
                <p className="text-muted">Enter your destination and find nearby parking areas on the map.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "#0d6efd",
                    color: "white",
                    borderRadius: "50%",
                    fontSize: "2rem"
                  }}
                >
                  <FaCar />
                </div>
                <h5 className="fw-bold">2. Select & Book</h5>
                <p className="text-muted">Choose your preferred slot, select time, and confirm your booking.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "#0d6efd",
                    color: "white",
                    borderRadius: "50%",
                    fontSize: "2rem"
                  }}
                >
                  <FaParking />
                </div>
                <h5 className="fw-bold">3. Park & Go</h5>
                <p className="text-muted">Arrive at your spot, park hassle-free, and enjoy your day.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-5 text-center text-white"
        style={{ background: "linear-gradient(135deg, #0d6efd, #3b82f6)" }}
      >
        <div className="container">
          <h2 className="fw-bold mb-3">Ready to Park Smarter?</h2>
          <p className="lead mb-4">Join thousands of users who save time and stress with ParkSmart.</p>
          <Link
            to="/login"
            className="btn btn-light btn-lg fw-bold px-5"
            style={{ borderRadius: "14px" }}
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4">
        <div className="container">
          <p className="mb-1 fw-bold">🚗 ParkSmart</p>
          <p className="mb-0 text-muted" style={{ fontSize: "0.9rem" }}>
            © {new Date().getFullYear()} ParkSmart. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;

