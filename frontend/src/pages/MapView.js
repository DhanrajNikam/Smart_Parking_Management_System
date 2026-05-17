
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import API from "../services/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

function MapView() {

  const [location, setLocation] = useState(null);
  const [parkings, setParkings] = useState([]);
  const [radius, setRadius] = useState(2);
  const [favorites, setFavorites] = useState([]);

  // NEW STATES
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("distance");

  const [showFullParking, setShowFullParking] =
    useState(true);

  const [availableOnly, setAvailableOnly] =
    useState(false);

  const [favoritesOnly, setFavoritesOnly] =
    useState(false);

  const [toast, setToast] = useState("");

  useEffect(() => {
    getCurrentLocation();
    fetchFavorites();
  }, []);

  // TOAST AUTO HIDE
  useEffect(() => {

    if (toast) {

      const timer = setTimeout(() => {
        setToast("");
      }, 3000);

      return () => clearTimeout(timer);
    }

  }, [toast]);

  // ================= GET LOCATION =================
  const getCurrentLocation = () => {

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(

      (pos) => {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setLocation([lat, lng]);

        fetchNearbyParking(lat, lng, radius);
      },

      () => {

        // fallback
        const lat = 19.9975;
        const lng = 73.7898;

        setLocation([lat, lng]);

        fetchNearbyParking(lat, lng, radius);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // ================= FETCH PARKING =================
  const fetchNearbyParking = async (lat, lng, r) => {

    try {

      const res = await API.get(
        `/parking/nearby?latitude=${lat}&longitude=${lng}&radius=${r}`
      );

      setParkings(res.data.data || []);

    } catch (error) {

      console.log("Error fetching parking:", error);
    }
  };

  // ================= FAVORITES =================
  const fetchFavorites = async () => {

    try {

      const res = await API.get("/favorites/my");

      setFavorites(res.data.map((f) => f.id));

    } catch (error) {

      console.log("Favorites error:", error);
    }
  };

  // ================= RADIUS =================
  const handleRadiusChange = (r) => {

    setRadius(r);

    if (location) {
      fetchNearbyParking(location[0], location[1], r);
    }
  };

  // ================= FAVORITE TOGGLE =================
  const toggleFavorite = async (locationId) => {

    try {

      if (favorites.includes(locationId)) {

        await API.delete(
          `/favorites/remove/${locationId}`
        );

        setFavorites(
          favorites.filter((id) => id !== locationId)
        );

      } else {

        await API.post("/favorites/add", {
          location_id: locationId
        });

        setFavorites([
          ...favorites,
          locationId
        ]);
      }

    } catch (error) {

      alert("Favorite action failed");
    }
  };

  // ================= ZOOM =================
  const getZoomLevel = () => {

    if (radius <= 1) return 15;
    if (radius <= 5) return 13;
    if (radius <= 25) return 11;
    if (radius <= 50) return 10;
    if (radius <= 100) return 8;

    return 6;
  };

  // ================= FILTER LOGIC =================
  let filteredParkings = [...parkings];

  filteredParkings = filteredParkings.filter((p) => {

    const text =
      `${p.name} ${p.address || ""}`.toLowerCase();

    const matchesSearch =
      text.includes(search.toLowerCase());

    const matchesAvailable =
      availableOnly
        ? Number(p.available_slots) > 0
        : true;

    const matchesFull =
      showFullParking
        ? true
        : Number(p.available_slots) > 0;

    const matchesFavorites =
      favoritesOnly
        ? favorites.includes(p.id)
        : true;

    return (
      matchesSearch &&
      matchesAvailable &&
      matchesFull &&
      matchesFavorites
    );
  });

  // ================= SORTING =================
  if (sortBy === "rating") {

    filteredParkings.sort(
      (a, b) =>
        Number(b.average_rating || 0) -
        Number(a.average_rating || 0)
    );
  }

  if (sortBy === "lowPrice") {

    filteredParkings.sort(
      (a, b) =>
        Number(a.price_per_hour) -
        Number(b.price_per_hour)
    );
  }

  if (sortBy === "highPrice") {

    filteredParkings.sort(
      (a, b) =>
        Number(b.price_per_hour) -
        Number(a.price_per_hour)
    );
  }

  // ================= LOADING =================
  if (!location) {

    return (
      <div>
        <Navbar />

        <div className="container mt-5">
          <h4>Getting your live location...</h4>
        </div>
      </div>
    );
  }

  return (

    <div>

      <Navbar />

      <div className="container mt-3">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">

          <h2>Nearby Parking</h2>

          <button
            className="btn btn-dark"
            onClick={getCurrentLocation}
          >
            📍 Refresh My Location
          </button>

        </div>

        {/* SEARCH */}
        <div className="mb-3">

          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search parking..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        {/* FILTERS */}
        <div className="d-flex flex-wrap gap-2 mb-3">

          <button
            className={`btn btn-sm ${
              availableOnly
                ? "btn-success"
                : "btn-outline-success"
            }`}
            onClick={() =>
              setAvailableOnly(!availableOnly)
            }
          >
            🅿 Available Only
          </button>

          <button
            className={`btn btn-sm ${
              showFullParking
                ? "btn-danger"
                : "btn-outline-danger"
            }`}
            onClick={() =>
              setShowFullParking(!showFullParking)
            }
          >
            🔴 Show Full Parking
          </button>

          <button
            className={`btn btn-sm ${
              favoritesOnly
                ? "btn-warning"
                : "btn-outline-warning"
            }`}
            onClick={() =>
              setFavoritesOnly(!favoritesOnly)
            }
          >
            ⭐ Favorites Only
          </button>

        </div>

        {/* SORT */}
        <select
          className="form-select mb-3"
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >

          <option value="distance">
            📍 Distance
          </option>

          <option value="rating">
            ⭐ Rating
          </option>

          <option value="lowPrice">
            💰 Price Low → High
          </option>

          <option value="highPrice">
            💰 Price High → Low
          </option>

        </select>

        {/* DISTANCE */}
        <div className="mb-3">

          <span className="me-2 fw-bold">
            Distance:
          </span>

          {[0.2, 0.5, 1, 2, 5, 10, 25, 50, 100, 200].map((r) => (

            <button
              key={r}
              className={`btn btn-sm me-2 mb-2 ${
                radius === r
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() =>
                handleRadiusChange(r)
              }
            >
              {r < 1
                ? `${r * 1000}m`
                : `${r}km`}
            </button>

          ))}

        </div>

        {/* MAP */}
        <MapContainer
          center={location}
          zoom={getZoomLevel()}
          scrollWheelZoom={true}
          style={{
            height: "clamp(400px, 70vh, 850px)",
            width: "100%",
            borderRadius: "12px"
          }}
        >

          {/* TILE */}
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* USER */}
          <Marker position={location}>

            <Popup>

              <div>
                <h6>You are here 📍</h6>

                <p style={{ marginBottom: 0 }}>
                  Current Live Location
                </p>
              </div>

            </Popup>

          </Marker>

          {/* PARKINGS */}
          {filteredParkings.map((p) => (

            <Marker
              key={p.id}
              position={[
                parseFloat(p.latitude),
                parseFloat(p.longitude)
              ]}
            >

              <Popup>

                <div style={{ width: "260px" }}>

                  <h4
                    style={{
                      fontWeight: "700",
                      marginBottom: "10px"
                    }}
                  >
                    {p.name}
                  </h4>

                  <hr />

                  {/* SLOT STATUS */}
                  {Number(p.available_slots) === 0 ? (

                    <div
                      className="alert alert-danger py-2"
                    >
                      ⚠ Parking Full
                      <br />
                      No slots available currently
                    </div>

                  ) : (

                    <p
                      style={{
                        color: "green",
                        fontWeight: "bold"
                      }}
                    >
                      🅿 Slots:
                      {" "}
                      {Number(p.available_slots)}
                      {" "}
                      Available
                    </p>

                  )}

                  {/* RATING */}
                  <p style={{ fontWeight: "600" }}>
                    ⭐
                    {" "}
                    {p.average_rating
                      ? `${Number(p.average_rating).toFixed(1)} / 5`
                      : "No Ratings Yet"}
                  </p>

                  {/* REVIEWS */}
                  <p style={{ fontWeight: "600" }}>
                    📝
                    {" "}
                    {p.total_reviews || 0}
                    {" "}
                    Reviews
                  </p>

                  {/* PRICE */}
                  <p style={{ fontWeight: "600" }}>
                    💰 ₹{p.price_per_hour}/hr
                  </p>

                  {/* DISTANCE */}
                  <p style={{ fontWeight: "600" }}>
                    📍
                    {" "}
                    {p.distance
                      ? `${Number(p.distance).toFixed(1)} km away`
                      : "0 km away"}
                  </p>

                  {/* BUTTONS */}
                  <div className="d-flex gap-2 flex-wrap mt-3">

                    {/* VIEW SLOTS */}
                    {Number(p.available_slots) > 0 ? (

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          (window.location.href = `/slots/${p.id}`)
                        }
                      >
                        View Slots
                      </button>

                    ) : (

                      <button
                        className="btn btn-danger btn-sm"
                        disabled
                        style={{
                          cursor: "not-allowed"
                        }}
                      >
                        Parking Full
                      </button>

                    )}

                    {/* NOTIFY */}
                    {Number(p.available_slots) === 0 && (

                      <button
                        className="btn btn-warning btn-sm"
                        onClick={async () => {

                          try {

                            await API.post(
                              "/parking-availability/notify",
                              {
                                parking_location_id: p.id
                              }
                            );

                            setToast(
                              "✅ Notification request saved"
                            );

                          } catch (err) {

                            setToast(
                              err.response?.data?.message ||
                              "❌ Request failed"
                            );
                          }
                        }}
                      >
                        🔔 Notify Me
                      </button>

                    )}

                    {/* FAVORITE */}
                    <button
                      className={`btn btn-sm ${
                        favorites.includes(p.id)
                          ? "btn-warning"
                          : "btn-outline-warning"
                      }`}
                      onClick={() =>
                        toggleFavorite(p.id)
                      }
                    >
                      {favorites.includes(p.id)
                        ? "⭐ Favorited"
                        : "☆ Favorite"}
                    </button>

                  </div>

                </div>

              </Popup>

            </Marker>

          ))}

        </MapContainer>

        {/* EMPTY */}
        {filteredParkings.length === 0 && (

          <div className="alert alert-warning mt-3">

            No parking locations found within
            {" "}
            {radius}
            {" "}
            km

          </div>

        )}

      </div>

      {/* TOAST */}
      {toast && (

        <div
          className="position-fixed bottom-0 end-0 p-3"
          style={{
            zIndex: 9999
          }}
        >

          <div className="toast show">

            <div className="toast-body">
              {toast}
            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default MapView;
