import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import MapComponent from "../components/MapComponent";

function CreateRide() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    from: "",
    to: "",
    routeAreas: "",
    date: "",
    time: "",
    seatsAvailable: 1,
    vehicleType: "car",
  });

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);

  // Route Modal States
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [routeStops, setRouteStops] = useState([{ id: Date.now(), value: "" }]);
  const [activeRouteId, setActiveRouteId] = useState(null);
  const [routeSuggestions, setRouteSuggestions] = useState([]);

  const fromTimeoutRef = useRef(null);
  const toTimeoutRef = useRef(null);
  const routeTimeoutRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  const fetchLocations = async (query, setSuggestions, timeoutRef) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await API.get(`/locations?search=${query}`);
        setSuggestions(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 300);
  };

  const handleSubmit = async () => {
    if (
      !form.from ||
      !form.to ||
      !form.date ||
      !form.time ||
      !form.seatsAvailable
    ) {
      toast.error("Please fill all details");
      return;
    }

    try {
      const routeAreasArray = form.routeAreas
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
        
      const allPickupPoints = Array.from(new Set([form.from, ...routeAreasArray, form.to]));

      await API.post("/rides", {
        ...form,
        routeAreas: allPickupPoints,
      });

      toast.success("Ride created successfully");
      navigate("/my-posted-rides");
    } catch (error) {
      console.error(error);
      toast.error("Error creating ride");
    }
  };

  const handleOpenRouteModal = () => {
    if (form.routeAreas) {
      const existing = form.routeAreas
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (existing.length > 0) {
        setRouteStops(existing.map((val, i) => ({ id: Date.now() + i, value: val })));
      } else {
        setRouteStops([{ id: Date.now(), value: "" }]);
      }
    } else {
      setRouteStops([{ id: Date.now(), value: "" }]);
    }
    setRouteSuggestions([]);
    setActiveRouteId(null);
    setShowRouteModal(true);
  };

  const handleSaveRouteAreas = () => {
    // Only save stops that aren't purely whitespace
    const validStops = routeStops
      .filter((s) => s.value.trim() !== "")
      .map((s) => s.value.trim());
      
    setForm({ ...form, routeAreas: validStops.join(", ") });
    setShowRouteModal(false);
  };

  // Compute places for the map
  const mapPlaces = [
    form.from,
    ...form.routeAreas.split(",").map((s) => s.trim()).filter(Boolean),
    form.to
  ].filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        Post a Ride
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* FORM LEFT SIDE */}
        <div className="flex-1 flex flex-col gap-5">
        {/* FROM + TO */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* FROM */}
          <div className="relative w-full">
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="From (e.g., Tambaram)"
              value={form.from}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, from: value });
                fetchLocations(value, setFromSuggestions, fromTimeoutRef);
              }}
            />

            {fromSuggestions.length > 0 && (
              <ul className="absolute bg-white border w-full max-h-40 overflow-y-auto z-10 rounded-lg shadow-lg mt-1">
                {fromSuggestions.map((item) => (
                  <li
                    key={item._id}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      setForm({ ...form, from: item.name });
                      setFromSuggestions([]);
                    }}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* TO */}
          <div className="relative w-full">
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="To (e.g., College)"
              value={form.to}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, to: value });
                fetchLocations(value, setToSuggestions, toTimeoutRef);
              }}
            />

            {toSuggestions.length > 0 && (
              <ul className="absolute bg-white border w-full max-h-40 overflow-y-auto z-10 rounded-lg shadow-lg mt-1">
                {toSuggestions.map((item) => (
                  <li
                    key={item._id}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      setForm({ ...form, to: item.name });
                      setToSuggestions([]);
                    }}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ROUTE AREAS (Trigger for Modal) */}
        <div
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 cursor-pointer text-gray-700 min-h-[50px] flex items-center hover:bg-gray-100 transition"
          onClick={handleOpenRouteModal}
        >
          {form.routeAreas ? (
            <span className="font-medium text-gray-800">{form.routeAreas}</span>
          ) : (
            <span className="text-gray-400">Select intermediate pickup points / Route areas (Optional)</span>
          )}
        </div>

        {/* DATE & TIME */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="date"
            min={today}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <input
            type="time"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>

        {/* VEHICLE TYPE & SEATS */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center justify-between px-4 py-3 rounded-lg border border-gray-300 bg-white">
             <span className="text-gray-600 font-medium">Vehicle Type:</span>
             <div className="flex gap-4">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input
                   type="radio"
                   name="vehicleType"
                   value="car"
                   checked={form.vehicleType === "car"}
                   onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                   className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                 />
                 <span className="text-gray-800">Car 🚗</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input
                   type="radio"
                   name="vehicleType"
                   value="bike"
                   checked={form.vehicleType === "bike"}
                   onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                   className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                 />
                 <span className="text-gray-800">Bike 🏍️</span>
               </label>
             </div>
          </div>

          <input
            type="number"
            min="1"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Seats Available"
            value={form.seatsAvailable}
            onChange={(e) => setForm({ ...form, seatsAvailable: e.target.value })}
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          className="w-full mt-2 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Post Ride
        </button>
        </div>

        {/* MAP RIGHT SIDE */}
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-700 mb-3">Live Route Preview</h3>
            <p className="text-sm text-gray-500 mb-4">
              As you enter your starting point, destination, and intermediate stops, your route will be plotted here.
            </p>
            <div className="flex-1">
              <MapComponent places={mapPlaces} />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {showRouteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col relative">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Pick up points</h3>

            <div className="flex-1 overflow-y-auto mb-6 pr-2 rounded-lg scrollbar-thin scrollbar-thumb-gray-300">
              {routeStops.map((stop, index) => (
                <div key={stop.id} className="relative mb-4 flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder={`Place ${index + 1}`}
                      value={stop.value}
                      onChange={(e) => {
                        const newVal = e.target.value;
                        setRouteStops((stops) =>
                          stops.map((s) => (s.id === stop.id ? { ...s, value: newVal } : s))
                        );
                        setActiveRouteId(stop.id);
                        fetchLocations(newVal, setRouteSuggestions, routeTimeoutRef);
                      }}
                      onFocus={() => {
                        setActiveRouteId(stop.id);
                        if (stop.value.length < 2) {
                          setRouteSuggestions([]);
                        } else {
                          fetchLocations(stop.value, setRouteSuggestions, routeTimeoutRef);
                        }
                      }}
                    />

                    {activeRouteId === stop.id && routeSuggestions.length > 0 && (
                      <ul className="absolute bg-white border border-gray-200 w-full max-h-48 overflow-y-auto z-20 rounded-lg shadow-xl mt-1">
                        {routeSuggestions.map((item) => (
                          <li
                            key={item._id}
                            className="p-3 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => {
                              setRouteStops((stops) =>
                                stops.map((s) =>
                                  s.id === stop.id ? { ...s, value: item.name } : s
                                )
                              );
                              setRouteSuggestions([]);
                            }}
                          >
                            {item.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {routeStops.length > 1 && (
                    <button
                      onClick={() =>
                        setRouteStops((stops) => stops.filter((s) => s.id !== stop.id))
                      }
                      className="text-red-500 hover:text-red-700 p-2 font-bold transition"
                      title="Remove"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={() => setRouteStops([...routeStops, { id: Date.now(), value: "" }])}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 mx-auto mt-6 transition shadow-sm border border-indigo-100"
                title="Add another place"
              >
                <span className="text-3xl font-light leading-none mb-1">+</span>
              </button>
            </div>

            <div className="flex gap-4 mt-auto">
              <button
                onClick={() => setShowRouteModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRouteAreas}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-md transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateRide;
