// import { useEffect, useState } from "react";
// import API from "../services/api";
// import Navbar from "../components/Navbar";

// function Users() {
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const res = await API.get("/admin/users");
//       setUsers(res.data);
//     } catch (error) {
//       console.log("Fetch users error:", error);
//     }
//   };

//   const toggleRole = async (id, currentRole) => {
//     const newRole = currentRole === "admin" ? "user" : "admin";
//     try {
//       await API.put(`/admin/users/${id}/role`, { role: newRole });
//       alert(`Role changed to ${newRole}`);
//       fetchUsers();
//     } catch (error) {
//       alert("Role update failed");
//     }
//   };

//   const toggleStatus = async (id, isActive) => {
//     try {
//       await API.put(`/admin/users/${id}/status`, { is_active: !isActive });
//       alert(`User ${!isActive ? "activated" : "blocked"}`);
//       fetchUsers();
//     } catch (error) {
//       alert("Status update failed");
//     }
//   };

//   return (
//     <div>
//       <Navbar />
//       <div className="container mt-4">
//         <h2>Users Management</h2>

//         <div className="table-responsive mt-3">
//           <table className="table table-bordered table-hover">
//             <thead className="table-dark">
//               <tr>
//                 <th>ID</th>
//                 <th>Name</th>
//                 <th>Email</th>
//                 <th>Role</th>
//                 <th>Status</th>
//                 <th>Total Bookings</th>
//                 <th>Joined</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.map((u) => (
//                 <tr key={u.id}>
//                   <td>{u.id}</td>
//                   <td>{u.name}</td>
//                   <td>{u.email}</td>
//                   <td>
//                     <span className={`badge ${u.role === "admin" ? "bg-danger" : "bg-primary"}`}>
//                       {u.role}
//                     </span>
//                   </td>
//                   <td>
//                     <span className={`badge ${u.is_active !== false ? "bg-success" : "bg-secondary"}`}>
//                       {u.is_active !== false ? "Active" : "Blocked"}
//                     </span>
//                   </td>
//                   <td>{u.total_bookings || 0}</td>
//                   <td>{new Date(u.created_at).toLocaleDateString()}</td>
//                   <td>
//                     <div className="d-flex gap-1">
//                       <button
//                         className={`btn btn-sm ${u.role === "admin" ? "btn-outline-primary" : "btn-outline-danger"}`}
//                         onClick={() => toggleRole(u.id, u.role)}
//                       >
//                         {u.role === "admin" ? "Make User" : "Make Admin"}
//                       </button>
//                       <button
//                         className={`btn btn-sm ${u.is_active !== false ? "btn-outline-secondary" : "btn-outline-success"}`}
//                         onClick={() => toggleStatus(u.id, u.is_active !== false)}
//                       >
//                         {u.is_active !== false ? "Block" : "Activate"}
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Users;



import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // FETCH USERS

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");

      setUsers(res.data);

    } catch (error) {
      console.log("Fetch users error:", error);
    }
  };

  // CHANGE ROLE

  const toggleRole = async (id, currentRole) => {

    const newRole =
      currentRole === "admin"
        ? "user"
        : "admin";

    try {

      await API.put(
        `/admin/users/${id}/role`,
        {
          role: newRole,
        }
      );

      alert(`Role changed to ${newRole}`);

      fetchUsers();

    } catch (error) {

      alert("Role update failed");

    }
  };

  // DELETE USER

  const deleteUser = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {

      await API.delete(`/admin/users/${id}`);

      alert("User deleted successfully");

      fetchUsers();

    } catch (error) {

      console.log(error);

      alert("Delete failed");

    }
  };

  return (
    <div>

      <Navbar />

      <div className="container mt-4">

        {/* TITLE */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>
            <h2 className="fw-bold mb-1">
              Users Management
            </h2>

            <p className="text-muted mb-0">
              Manage all registered users
            </p>
          </div>

          <div className="badge bg-dark fs-6 p-2">
            Total Users: {users.length}
          </div>

        </div>

        {/* TABLE */}

        <div className="card shadow border-0">

          <div className="card-body">

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-dark">

                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Total Bookings</th>
                    <th>Joined</th>
                    <th className="text-center">
                      Actions
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {users.length > 0 ? (

                    users.map((u) => (

                      <tr key={u.id}>

                        <td>
                          <strong>#{u.id}</strong>
                        </td>

                        <td className="fw-semibold">
                          {u.name}
                        </td>

                        <td>
                          {u.email}
                        </td>

                        <td>

                          <span
                            className={`badge px-3 py-2 ${
                              u.role === "admin"
                                ? "bg-danger"
                                : "bg-primary"
                            }`}
                          >
                            {u.role}
                          </span>

                        </td>

                        <td>

                          <span className="badge bg-success">
                            {u.total_bookings || 0}
                          </span>

                        </td>

                        <td>

                          {new Date(
                            u.created_at
                          ).toLocaleDateString()}

                        </td>

                        <td>

                          <div className="d-flex justify-content-center gap-2">

                            {/* ROLE BUTTON */}

                            <button
                              className={`btn btn-sm ${
                                u.role === "admin"
                                  ? "btn-outline-primary"
                                  : "btn-outline-warning"
                              }`}
                              onClick={() =>
                                toggleRole(
                                  u.id,
                                  u.role
                                )
                              }
                            >
                              {u.role === "admin"
                                ? "Make User"
                                : "Make Admin"}
                            </button>

                            {/* DELETE BUTTON */}

                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                deleteUser(u.id)
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>

                      <td
                        colSpan="7"
                        className="text-center py-4 text-muted"
                      >
                        No users found
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Users;