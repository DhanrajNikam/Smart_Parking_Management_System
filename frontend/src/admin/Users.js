import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.log("Fetch users error:", error);
    }
  };

  const toggleRole = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await API.put(`/admin/users/${id}/role`, { role: newRole });
      alert(`Role changed to ${newRole}`);
      fetchUsers();
    } catch (error) {
      alert("Role update failed");
    }
  };

  const toggleStatus = async (id, isActive) => {
    try {
      await API.put(`/admin/users/${id}/status`, { is_active: !isActive });
      alert(`User ${!isActive ? "activated" : "blocked"}`);
      fetchUsers();
    } catch (error) {
      alert("Status update failed");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h2>Users Management</h2>

        <div className="table-responsive mt-3">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Total Bookings</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === "admin" ? "bg-danger" : "bg-primary"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active !== false ? "bg-success" : "bg-secondary"}`}>
                      {u.is_active !== false ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td>{u.total_bookings || 0}</td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className={`btn btn-sm ${u.role === "admin" ? "btn-outline-primary" : "btn-outline-danger"}`}
                        onClick={() => toggleRole(u.id, u.role)}
                      >
                        {u.role === "admin" ? "Make User" : "Make Admin"}
                      </button>
                      <button
                        className={`btn btn-sm ${u.is_active !== false ? "btn-outline-secondary" : "btn-outline-success"}`}
                        onClick={() => toggleStatus(u.id, u.is_active !== false)}
                      >
                        {u.is_active !== false ? "Block" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Users;

