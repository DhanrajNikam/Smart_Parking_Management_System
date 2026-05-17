import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

function Navbar() {

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {

    fetchUnreadCount();

    const interval = setInterval(
      fetchUnreadCount,
      30000
    );

    return () => clearInterval(interval);

  }, []);

  const fetchUnreadCount = async () => {

    try {

      const res = await API.get(
        "/notifications/my"
      );

      const unread = res.data.filter(
        (n) => !n.is_read
      ).length;

      setUnreadCount(unread);

    } catch (error) {

      console.log(
        "Notification fetch error:",
        error
      );

    }
  };

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");

  };

  return (

    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">

      <div className="container">

        {/* ================= LOGO ================= */}

        <Link
          className="navbar-brand fw-bold"
          to={
            user.role === "admin"
              ? "/admin"
              : "/dashboard"
          }
        >
          🚗 ParkSmart
        </Link>

        {/* ================= MOBILE TOGGLE ================= */}

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#parkSmartNavbar"
          aria-controls="parkSmartNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* ================= NAVBAR CONTENT ================= */}

        <div
          className="collapse navbar-collapse"
          id="parkSmartNavbar"
        >

          <div className="d-flex align-items-center gap-2 flex-wrap ms-auto">

            {/* ================================================= */}
            {/* USER NAVBAR */}
            {/* ================================================= */}

            {user.role !== "admin" && (
              <>

                <Link
                  className="btn btn-outline-light btn-sm"
                  to="/dashboard"
                >
                  Dashboard
                </Link>

                <Link
                  className="btn btn-outline-light btn-sm"
                  to="/map"
                >
                  Find Parking
                </Link>

                <Link
                  className="btn btn-outline-light btn-sm"
                  to="/mybookings"
                >
                  My Bookings
                </Link>

                <Link
                  className="btn btn-outline-light btn-sm"
                  to="/wallet"
                >
                  Wallet
                </Link>

                <Link
                  className="btn btn-outline-light btn-sm"
                  to="/support-center"
                >
                  Support
                </Link>

                {/* ================= QR SCANNER ================= */}

                <Link
                  className="btn btn-warning btn-sm fw-bold"
                  to="/guard-scanner"
                >
                  📷 QR Scanner
                </Link>

                {/* ================= NOTIFICATIONS ================= */}

                <Link
                  className="btn btn-outline-light btn-sm position-relative"
                  to="/notifications"
                >
                  🔔

                  {unreadCount > 0 && (
                    <span
                      className="
                        position-absolute
                        top-0
                        start-100
                        translate-middle
                        badge
                        rounded-pill
                        bg-danger
                      "
                    >
                      {unreadCount}
                    </span>
                  )}

                </Link>

              </>
            )}

            {/* ================================================= */}
            {/* ADMIN NAVBAR */}
            {/* ================================================= */}

            {user.role === "admin" && (
              <>

                <Link
                  className="btn btn-outline-light btn-sm"
                  to="/admin"
                >
                  Admin Dashboard
                </Link>

                <Link
                  className="btn btn-outline-light btn-sm"
                  to="/admin/manage-parking"
                >
                  Manage Parking
                </Link>

                <Link
                  className="btn btn-outline-light btn-sm"
                  to="/admin/bookings"
                >
                  Bookings
                </Link>

                <Link
                  className="btn btn-outline-light btn-sm"
                  to="/admin/users"
                >
                  Users
                </Link>

                <Link
                  className="btn btn-outline-light btn-sm"
                  to="/admin/reports"
                >
                  Reports
                </Link>

                <Link
                  className="btn btn-outline-light btn-sm"
                  to="/admin/refund-requests"
                >
                  Refund Requests
                </Link>

                <Link
                  className="btn btn-outline-light btn-sm"
                  to="/admin/support-tickets"
                >
                  Support Tickets
                </Link>

                {/* ================= ADMIN QR SCANNER ================= */}

                <Link
                  className="btn btn-warning btn-sm fw-bold"
                  to="/guard-scanner"
                >
                  📷 QR Scanner
                </Link>

              </>
            )}

            {/* ================= LOGOUT ================= */}

            <button
              className="btn btn-danger btn-sm"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </div>

      </div>

    </nav>

  );
}

export default Navbar;