import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications/my");
      setNotifications(res.data);
    } catch (error) {
      console.log("Fetch notifications error:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/read/${id}`);
      fetchNotifications();
    } catch (error) {
      console.log("Mark read error:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.is_read);
      for (let n of unread) {
        await API.put(`/notifications/read/${n.id}`);
      }
      fetchNotifications();
    } catch (error) {
      console.log("Mark all read error:", error);
    }
  };

  const getIcon = (type) => {
    if (type === "reminder") return "⏰";
    if (type === "alert") return "🔔";
    return "📢";
  };

  // ✅ FORMAT DATE (CLEAN)
  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div>
      <Navbar />

      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Notifications</h2>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={markAllAsRead}
          >
            Mark All as Read
          </button>
        </div>

        {notifications.length === 0 ? (
          <p className="text-muted">No notifications yet.</p>
        ) : (
          <div className="list-group">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`list-group-item d-flex justify-content-between align-items-start ${
                  !n.is_read ? "bg-light border-primary" : ""
                }`}
              >
                <div>
                  {/* ICON */}
                  <span className="me-2">{getIcon(n.type)}</span>

                  {/* MESSAGE (MULTILINE SUPPORT) */}
                  <div style={{ whiteSpace: "pre-line" }}>
                    {n.message}
                  </div>

                  {/* DATE */}
                  <small className="text-muted">
                    🕒 {formatDate(n.created_at)}
                  </small>
                </div>

                {/* MARK READ BUTTON */}
                {!n.is_read && (
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => markAsRead(n.id)}
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;