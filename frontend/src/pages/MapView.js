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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation([lat, lng]);
          fetchNearbyParking(lat, lng, 2);
          fetchFavorites();
        },
        () => {
          const lat = 19.9975;
          const lng = 73.7898;
          setLocation([lat, lng]);
          fetchNearbyParking(lat, lng, 2);
          fetchFavorites();
        }
      );
    }
  }, []);

  const fetchNearbyParking = async (lat, lng, r) => {
    try {
      const res = await API.get(
        `/parking/nearby?latitude=${lat}&longitude=${lng}&radius=${r}&availableOnly=true`
      );
      setParkings(res.data.data || []);
    } catch (error) {
      console.log("Error fetching parking:", error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await API.get("/favorites/my");
      setFavorites(res.data.map((f) => f.id));
    } catch (error) {
      console.log("Favorites error:", error);
    }
  };

  const handleRadiusChange = (r) => {
    setRadius(r);
    if (location) {
      fetchNearbyParking(location[0], location[1], r);
    }
  };

  const toggleFavorite = async (locationId) => {
    try {
      if (favorites.includes(locationId)) {
        await API.delete(`/favorites/remove/${locationId}`);
        setFavorites(favorites.filter((id) => id !== locationId));
      } else {
        await API.post("/favorites/add", { location_id: locationId });
        setFavorites([...favorites, locationId]);
      }
    } catch (error) {
      alert("Favorite action failed");
    }
  };

  if (!location) return <p>Getting your location...</p>;

  return (
    <div>
      <Navbar />
      <div className="container mt-3">
        <h2>Nearby Parking</h2>

        <div className="mb-3">
          <span className="me-2">Distance:</span>
          {[0.2, 0.5, 1, 2, 5].map((r) => (
            <button
              key={r}
              className={`btn btn-sm me-2 ${radius === r ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => handleRadiusChange(r)}
            >
              {r < 1 ? `${r * 1000}m` : `${r}km`}
            </button>
          ))}
        </div>

        <MapContainer
          center={location}
          zoom={14}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={location}>
            <Popup>You are here 📍</Popup>
          </Marker>

          {parkings.map((p) => (
            <Marker
              key={p.id}
              position={[parseFloat(p.latitude), parseFloat(p.longitude)]}
            >
              <Popup>
                <h5>{p.name}</h5>
                <p>
                  <b>Distance:</b>{" "}
                  {p.distance ? Number(p.distance).toFixed(2) : "0"} km
                </p>
                <p>
                  <b>Available Slots:</b> {p.available_slots}
                </p>
                <p>
                  <b>Price:</b> ₹{p.price_per_hour}/hr
                </p>
                <button
                  className="btn btn-primary btn-sm me-2"
                  onClick={() => (window.location.href = `/slots/${p.id}`)}
                >
                  View Slots
                </button>
                <button
                  className={`btn btn-sm ${
                    favorites.includes(p.id) ? "btn-warning" : "btn-outline-warning"
                  }`}
                  onClick={() => toggleFavorite(p.id)}
                >
                  {favorites.includes(p.id) ? "⭐ Favorited" : "☆ Favorite"}
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapView;

