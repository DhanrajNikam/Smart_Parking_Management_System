import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import ReviewRatingCard from "../components/ReviewRatingCard";

function Dashboard() {

  const navigate = useNavigate();

  const [data, setData] = useState({
    user_name: "",
    available_slots: 0,
    occupied_slots: 0,
    active_bookings: 0,
    favorite_locations: 0
  });

  const [favorites, setFavorites] = useState([]);
  const [nearestParking, setNearestParking] = useState(null);
  const [loadingNearest, setLoadingNearest] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchFavorites();
    fetchNearestParking();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/user/dashboard");
      setData(res.data);
    } catch (error) {
      console.log("Dashboard error:", error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await API.get("/favorites/my");

      // Expected: favorites array from backend.
      // We also try to enrich each favorite with rating summary.
      const favs = res.data || [];

      const enriched = await Promise.all(
        favs.map(async (f) => {
          try {
            const reviewRes = await API.get(`/parking/${f.id}/reviews`);
            return { ...f, ...(reviewRes.data || {}) };
          } catch (e) {
            return f;
          }
        })
      );

      setFavorites(enriched);
    } catch (error) {
      console.log("Favorites error:", error);
    }
  };


  const fetchNearestParking = () => {
    setLoadingNearest(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await API.get(
              `/parking/nearby?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&radius=2&availableOnly=true&limit=1`
            );

            if (res.data.data && res.data.data.length > 0) {
              setNearestParking(res.data.data[0]);
            }
          } catch (error) {
            console.log("Nearest parking error:", error);
          }

          setLoadingNearest(false);
        },
        () => {
          setLoadingNearest(false);
        }
      );
    } else {
      setLoadingNearest(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fc"
      }}
    >
      <Navbar />

      <div className="container py-4">

        {/* Welcome Section */}

        <div
          className="p-4 mb-4 shadow-sm"
          style={{
            borderRadius: "20px",
            background:
              "linear-gradient(135deg, #0d6efd, #3b82f6, #60a5fa)",
            color: "white"
          }}
        >
          <h2 className="fw-bold">
            Welcome back, {data.user_name || "User"} 👋
          </h2>

          <p className="mb-0">
            Find the perfect parking spot for your vehicle quickly and easily.
          </p>
        </div>

        {/* Stats Cards */}

        <div className="row g-4">

          <div className="col-md-3">
            <div
              className="card border-0 shadow-sm text-center p-4"
              style={{ borderRadius: "18px" }}
            >
              <h6 className="text-success fw-bold">
                Available Slots
              </h6>
              <h1 className="fw-bold">{data.available_slots}</h1>
            </div>
          </div>

          <div className="col-md-3">
            <div
              className="card border-0 shadow-sm text-center p-4"
              style={{ borderRadius: "18px" }}
            >
              <h6 className="text-danger fw-bold">
                Occupied Slots
              </h6>
              <h1 className="fw-bold">{data.occupied_slots}</h1>
            </div>
          </div>

          <div className="col-md-3">
            <div
              className="card border-0 shadow-sm text-center p-4"
              style={{ borderRadius: "18px" }}
            >
              <h6 className="text-primary fw-bold">
                Active Bookings
              </h6>
              <h1 className="fw-bold">{data.active_bookings}</h1>
            </div>
          </div>

          <div className="col-md-3">
            <div
              className="card border-0 shadow-sm text-center p-4"
              style={{ borderRadius: "18px" }}
            >
              <h6 className="text-warning fw-bold">
                Favorites
              </h6>
              <h1 className="fw-bold">{data.favorite_locations}</h1>
            </div>
          </div>

        </div>

        {/* Nearest Parking */}

        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="fw-bold">
              📍 Nearest Parking Suggestion
            </h3>

            <button
              className="btn btn-primary px-4"
              style={{
                borderRadius: "12px"
              }}
              onClick={() => navigate("/map")}
            >
              Find Parking Near Me
            </button>
          </div>

          {loadingNearest ? (
            <div className="alert alert-info">
              Finding nearest parking...
            </div>
          ) : nearestParking ? (
            <div
              className="card border-0 shadow-sm"
              style={{
                borderRadius: "20px"
              }}
            >
              <div className="card-body p-4">
                <div className="row align-items-center">

                  <div className="col-md-8">
                    <h4 className="fw-bold">
                      {nearestParking.name}
                    </h4>

                    <p className="text-muted">
                      {nearestParking.address}
                    </p>

                    <div className="d-flex flex-wrap gap-2">

                      <span className="badge bg-success p-2">
                        {nearestParking.available_slots} Slots Available
                      </span>

                      <span className="badge bg-primary p-2">
                        ₹{nearestParking.price_per_hour}/hr
                      </span>

                      <span className="badge bg-dark p-2">
                        {nearestParking.distance
                          ? Number(nearestParking.distance).toFixed(2)
                          : "0"} km away
                      </span>

                    </div>
                  </div>

                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    <button
                      className="btn btn-success btn-lg px-4"
                      style={{
                        borderRadius: "14px"
                      }}
                      onClick={() =>
                        navigate(`/slots/${nearestParking.id}`)
                      }
                    >
                      Book Now
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-secondary">
              No nearby parking found. Try map view.
            </div>
          )}
        </div>

        {/* Favorite Parking */}

        <div className="mt-5">
          <h3 className="fw-bold mb-3">
            ⭐ Favorite Parking
          </h3>

          {favorites.length === 0 ? (
            <div className="alert alert-light shadow-sm">
              No favorite parking added yet
            </div>
          ) : (
            <div className="row g-4">
              {favorites.map((fav) => (
                <div className="col-md-4" key={fav.id}>
                  <div
                    className="card border-0 shadow-sm h-100"
                    style={{ borderRadius: "18px" }}
                  >
                    <div className="card-body p-4">
                      <h5 className="fw-bold">{fav.name}</h5>
                      <p className="text-muted">{fav.address}</p>

                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span style={{ color: "#fbbf24" }}>⭐</span>
                        <span style={{ fontWeight: 800 }}>
                          {fav.average_rating ?? "-"}
                        </span>
                        <span style={{ color: "#64748b", fontWeight: 600 }}>
                          ({fav.total_reviews ?? 0} reviews)
                        </span>
                      </div>

                      <button
                        className="btn btn-outline-primary"
                        style={{ borderRadius: "12px" }}
                        onClick={() => navigate(`/slots/${fav.id}`)}
                      >
                        View Slots
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Dashboard;