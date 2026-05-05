// import { useEffect, useState } from "react";
// import API from "../services/api";
// import Navbar from "../components/Navbar";

// function ManageParking() {
//   const [locations, setLocations] = useState([]);
//   const [selectedLocation, setSelectedLocation] = useState(null);
//   const [slots, setSlots] = useState([]);
//   const [newSlotNumber, setNewSlotNumber] = useState("");
//   const [newLocation, setNewLocation] = useState({
//     name: "",
//     address: "",
//     latitude: "",
//     longitude: "",
//     total_slots: "",
//     price_per_hour: ""
//   });

//   useEffect(() => {
//     fetchLocations();
//   }, []);

//   const fetchLocations = async () => {
//     try {
//       const res = await API.get("/parking/");
//       setLocations(res.data);
//     } catch (error) {
//       console.log("Fetch locations error:", error);
//     }
//   };

//   const fetchSlots = async (locationId) => {
//     try {
//       const res = await API.get(`/parking/${locationId}/slots`);
//       setSlots(res.data);
//       setSelectedLocation(locationId);
//     } catch (error) {
//       console.log("Fetch slots error:", error);
//     }
//   };

//   const addSlot = async () => {
//     if (!newSlotNumber || !selectedLocation) return;
//     try {
//       await API.post("/parking/add-slot", {
//         location_id: selectedLocation,
//         slot_number: newSlotNumber
//       });
//       setNewSlotNumber("");
//       fetchSlots(selectedLocation);
//       alert("Slot added successfully");
//     } catch (error) {
//       alert(error.response?.data?.message || "Failed to add slot");
//     }
//   };

//   const removeSlot = async (slotId) => {
//     if (!window.confirm("Remove this slot?")) return;
//     try {
//       await API.delete("/parking/remove-slot", { data: { slot_id: slotId } });
//       fetchSlots(selectedLocation);
//       alert("Slot removed");
//     } catch (error) {
//       alert(error.response?.data?.message || "Failed to remove slot");
//     }
//   };

//   const updateSlotStatus = async (slotId, status) => {
//     try {
//       await API.put("/parking/slot-status", { slot_id: slotId, status });
//       fetchSlots(selectedLocation);
//     } catch (error) {
//       alert("Failed to update status");
//     }
//   };

//   const addLocation = async () => {
//     try {
//       await API.post("/parking/add-location", newLocation);
//       setNewLocation({
//         name: "",
//         address: "",
//         latitude: "",
//         longitude: "",
//         total_slots: "",
//         price_per_hour: ""
//       });
//       fetchLocations();
//       alert("Location added successfully");
//     } catch (error) {
//       alert(error.response?.data?.message || "Failed to add location");
//     }
//   };

//   const getSlotColor = (status) => {
//     if (status === "available") return "#28a745";
//     if (status === "occupied") return "#dc3545";
//     if (status === "reserved") return "#ffc107";
//     return "#6c757d";
//   };

//   return (
//     <div>
//       <Navbar />
//       <div className="container mt-4">
//         <h2>Manage Parking</h2>

//         {/* Add Location Form */}
//         <div className="card shadow p-3 mt-3">
//           <h5>➕ Add New Parking Location</h5>
//           <div className="row g-2">
//             <div className="col-md-2">
//               <input className="form-control" placeholder="Name" value={newLocation.name} onChange={(e) => setNewLocation({...newLocation, name: e.target.value})} />
//             </div>
//             <div className="col-md-3">
//               <input className="form-control" placeholder="Address" value={newLocation.address} onChange={(e) => setNewLocation({...newLocation, address: e.target.value})} />
//             </div>
//             <div className="col-md-2">
//               <input className="form-control" placeholder="Latitude" value={newLocation.latitude} onChange={(e) => setNewLocation({...newLocation, latitude: e.target.value})} />
//             </div>
//             <div className="col-md-2">
//               <input className="form-control" placeholder="Longitude" value={newLocation.longitude} onChange={(e) => setNewLocation({...newLocation, longitude: e.target.value})} />
//             </div>
//             <div className="col-md-1">
//               <input className="form-control" placeholder="Slots" type="number" value={newLocation.total_slots} onChange={(e) => setNewLocation({...newLocation, total_slots: e.target.value})} />
//             </div>
//             <div className="col-md-1">
//               <input className="form-control" placeholder="Price" type="number" value={newLocation.price_per_hour} onChange={(e) => setNewLocation({...newLocation, price_per_hour: e.target.value})} />
//             </div>
//             <div className="col-md-1">
//               <button className="btn btn-primary w-100" onClick={addLocation}>Add</button>
//             </div>
//           </div>
//         </div>

//         {/* Locations List */}
//         <h5 className="mt-4">📍 Parking Locations</h5>
//         <div className="row">
//           {locations.map((loc) => (
//             <div className="col-md-4 mb-3" key={loc.id}>
//               <div className={`card shadow ${selectedLocation === loc.id ? "border-primary" : ""}`}>
//                 <div className="card-body">
//                   <h5>{loc.name}</h5>
//                   <p className="text-muted">{loc.address}</p>
//                   <p>Price: ₹{loc.price_per_hour}/hr | Total Slots: {loc.total_slots}</p>
//                   <button className="btn btn-primary btn-sm" onClick={() => fetchSlots(loc.id)}>
//                     View Slots
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Slot Grid */}
//         {selectedLocation && (
//           <div className="mt-4">
//             <div className="d-flex justify-content-between align-items-center mb-3">
//               <h5>Slot Layout</h5>
//               <div className="d-flex gap-2">
//                 <input
//                   className="form-control form-control-sm"
//                   placeholder="New Slot (e.g. C1)"
//                   value={newSlotNumber}
//                   onChange={(e) => setNewSlotNumber(e.target.value)}
//                   style={{ width: "150px" }}
//                 />
//                 <button className="btn btn-success btn-sm" onClick={addSlot}>
//                   Add Slot
//                 </button>
//               </div>
//             </div>

//             <div className="d-flex gap-3 mb-3">
//               <span>🟢 Available</span>
//               <span>🔴 Occupied</span>
//               <span>🟡 Reserved</span>
//             </div>

//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
//                 gap: "15px"
//               }}
//             >
//               {slots.map((slot) => (
//                 <div
//                   key={slot.id}
//                   className="card text-white"
//                   style={{ backgroundColor: getSlotColor(slot.status) }}
//                 >
//                   <div className="card-body text-center p-2">
//                     <h5>{slot.slot_number}</h5>
//                     <select
//                       className="form-select form-select-sm mb-2"
//                       value={slot.status}
//                       onChange={(e) => updateSlotStatus(slot.id, e.target.value)}
//                     >
//                       <option value="available">Available</option>
//                       <option value="occupied">Occupied</option>
//                       <option value="reserved">Reserved</option>
//                     </select>
//                     <button
//                       className="btn btn-light btn-sm text-danger"
//                       onClick={() => removeSlot(slot.id)}
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ManageParking;


import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function ManageParking() {
const [locations, setLocations] = useState([]);
const [selectedLocation, setSelectedLocation] = useState(null);
const [slots, setSlots] = useState([]);
const [newSlotNumber, setNewSlotNumber] = useState("");

const [newLocation, setNewLocation] = useState({
name: "",
address: "",
latitude: "",
longitude: "",
total_slots: "",
price_per_hour: ""
});

useEffect(() => {
fetchLocations();
}, []);

const fetchLocations = async () => {
try {
const res = await API.get("/parking/");
setLocations(res.data);
} catch (error) {
console.log("Fetch locations error:", error);
}
};

const fetchSlots = async (locationId) => {
try {
const res = await API.get(`/parking/${locationId}/slots`);
setSlots(res.data);
setSelectedLocation(locationId);
} catch (error) {
console.log("Fetch slots error:", error);
}
};

const addSlot = async () => {
if (!newSlotNumber || !selectedLocation) return;


try {
  await API.post("/parking/add-slot", {
    location_id: selectedLocation,
    slot_number: newSlotNumber
  });

  setNewSlotNumber("");
  fetchSlots(selectedLocation);
  alert("Slot added successfully");
} catch (error) {
  alert(error.response?.data?.message || "Failed to add slot");
}


};

const addLocation = async () => {
console.log("ADD CLICKED", newLocation);


if (
  !newLocation.name ||
  !newLocation.address ||
  !newLocation.latitude ||
  !newLocation.longitude ||
  !newLocation.total_slots ||
  !newLocation.price_per_hour
) {
  alert("Please fill all fields");
  return;
}

try {
  const res = await API.post("/parking/add-location", newLocation);
  console.log("SUCCESS:", res.data);

  alert("Location added successfully");

  setNewLocation({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    total_slots: "",
    price_per_hour: ""
  });

  fetchLocations();
} catch (error) {
  console.log("ERROR:", error);
  alert(error.response?.data?.message || "Failed to add location");
}


};

const getSlotColor = (status) => {
if (status === "available") return "#28a745";
if (status === "occupied") return "#dc3545";
if (status === "reserved") return "#ffc107";
return "#6c757d";
};

return ( <div> <Navbar /> <div className="container mt-4"> <h2>Manage Parking</h2>


    {/* Add Location */}
    <div className="card shadow p-3 mt-3">
      <h5>Add New Parking Location</h5>

      <input
        className="form-control mb-2"
        placeholder="Name"
        value={newLocation.name}
        onChange={(e) =>
          setNewLocation({ ...newLocation, name: e.target.value })
        }
      />

      <input
        className="form-control mb-2"
        placeholder="Address"
        value={newLocation.address}
        onChange={(e) =>
          setNewLocation({ ...newLocation, address: e.target.value })
        }
      />

      <input
        className="form-control mb-2"
        placeholder="Latitude"
        value={newLocation.latitude}
        onChange={(e) =>
          setNewLocation({ ...newLocation, latitude: e.target.value })
        }
      />

      <input
        className="form-control mb-2"
        placeholder="Longitude"
        value={newLocation.longitude}
        onChange={(e) =>
          setNewLocation({ ...newLocation, longitude: e.target.value })
        }
      />

      <input
        className="form-control mb-2"
        placeholder="Slots"
        type="number"
        value={newLocation.total_slots}
        onChange={(e) =>
          setNewLocation({
            ...newLocation,
            total_slots: e.target.value
          })
        }
      />

      <input
        className="form-control mb-2"
        placeholder="Price"
        type="number"
        value={newLocation.price_per_hour}
        onChange={(e) =>
          setNewLocation({
            ...newLocation,
            price_per_hour: e.target.value
          })
        }
      />

      <button
        type="button"
        className="btn btn-primary"
        onClick={addLocation}
      >
        Add
      </button>
    </div>

    {/* Locations */}
    <h5 className="mt-4">Parking Locations</h5>

    <div className="row">
      {locations.map((loc) => (
        <div className="col-md-4 mb-3" key={loc.id}>
          <div className="card shadow">
            <div className="card-body">
              <h5>{loc.name}</h5>
              <p>{loc.address}</p>
              <p>
                ₹{loc.price_per_hour}/hr | {loc.total_slots} slots
              </p>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => fetchSlots(loc.id)}
              >
                View Slots
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Slots */}
    {selectedLocation && (
      <div className="mt-4">
        <h5>Slot Layout</h5>

        <input
          className="form-control mb-2"
          placeholder="New Slot (e.g. A1)"
          value={newSlotNumber}
          onChange={(e) => setNewSlotNumber(e.target.value)}
        />

        <button className="btn btn-success mb-3" onClick={addSlot}>
          Add Slot
        </button>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {slots.map((slot) => (
            <div
              key={slot.id}
              style={{
                backgroundColor: getSlotColor(slot.status),
                color: "white",
                padding: "10px",
                borderRadius: "5px"
              }}
            >
              {slot.slot_number}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
</div>

);
}

export default ManageParking;
