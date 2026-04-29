import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get("/notifications/my");
      const unread = res.data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.log("Notification fetch error:", error);
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
        <Link className="navbar-brand" to={user.role === "admin" ? "/admin" : "/dashboard"}>
          🚗 ParkSmart
        </Link>

        <div className="d-flex align-items-center gap-2">
          {user.role !== "admin" && (
            <>
              <Link className="btn btn-outline-light btn-sm" to="/dashboard">
                Dashboard
              </Link>
              <Link className="btn btn-outline-light btn-sm" to="/map">
                Find Parking
              </Link>
              <Link className="btn btn-outline-light btn-sm" to="/mybookings">
                My Bookings
              </Link>
              <Link className="btn btn-outline-light btn-sm position-relative" to="/notifications">
                🔔
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {user.role === "admin" && (
            <>
              <Link className="btn btn-outline-light btn-sm" to="/admin">
                Admin Dashboard
              </Link>
              <Link className="btn btn-outline-light btn-sm" to="/admin/manage-parking">
                Manage Parking
              </Link>
              <Link className="btn btn-outline-light btn-sm" to="/admin/bookings">
                Bookings
              </Link>
              <Link className="btn btn-outline-light btn-sm" to="/admin/users">
                Users
              </Link>
              <Link className="btn btn-outline-light btn-sm" to="/admin/reports">
                Reports
              </Link>
            </>
          )}

          <button className="btn btn-danger btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

