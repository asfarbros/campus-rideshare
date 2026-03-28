import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

function SearchRide() {
  const navigate = useNavigate();
  const [area, setArea] = useState("");
  const [rides, setRides] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const timeoutRef = useRef(null);

  const fetchLocations = async (query) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(async () => {
      if (query.length < 1) {
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

  const search = async () => {
    if (!area) {
      toast.error("Please enter an area to search for rides!");
      return;
    }

    try {
      const searchArea = area.toLowerCase().trim();
      const res = await API.get(`/rides?area=${searchArea}`);

      if (res.data.length === 0) {
        toast.error("Rides are not available for the specified area");
      } else {
        toast.success(`${res.data.length} rides are present`);
      }

      setRides(res.data);
      setShowSuggestions(false);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching rides");
    }
  };

  const requestRide = async (rideId) => {
    try {
      await API.post("/requests", { rideId });
      toast.success("Ride requested successfully!");
      navigate("/my-rides");
    } catch (error) {
      console.error(error);
      toast.error("Failed to request ride");
    }
  };

  const handleSelect = (selectedArea) => {
    setArea(selectedArea);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-4">Search Ride</h2>

      <div className="relative flex gap-3 mb-8">
        <input
          placeholder="Enter Area (e.g., Sholinganallur)"
          value={area}
          onFocus={() => setShowSuggestions(true)}
          onChange={(e) => {
            const val = e.target.value;
            setArea(val);
            setShowSuggestions(true);
            fetchLocations(val);
          }}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-700"
        />

        {showSuggestions && area && (
          <div className="absolute top-full left-0 w-[calc(100%-125px)] bg-white border border-gray-200 rounded-xl mt-1 shadow-2xl z-50 overflow-hidden">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <div
                  key={suggestion._id}
                  onClick={() => handleSelect(suggestion.name)}
                  className="px-4 py-3 hover:bg-indigo-50 cursor-pointer text-gray-700 border-b border-gray-50 last:border-b-0 transition-colors"
                >
                  {suggestion.name}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-400 text-sm">No areas found...</div>
            )}
          </div>
        )}

        <button onClick={search} className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 shadow-md transition-all">
          Search
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {rides.map((r) => (
          <div key={r._id} className="bg-white shadow-lg p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 transition-transform hover:-translate-y-1">
            
            {/* NEW: Driver Name Section */}
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Posted by</span>
                <span className="font-bold text-gray-700 text-sm">
                   👤 {r.driver?.name || "Member"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full capitalize">
                  {r.vehicleType === 'bike' ? '🏍️ Bike' : '🚗 Car'}
                </span>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                  {r.seatsAvailable} Seats
                </span>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <p className="font-extrabold text-xl text-gray-800 capitalize">
                {r.from} <span className="text-indigo-500 mx-2">→</span> {r.to}
              </p>
            </div>

            <div className="flex justify-between text-gray-600 bg-gray-50 p-3 rounded-lg">
              <div className="flex flex-col">
                <span className="text-xs uppercase font-bold text-gray-400">Date</span>
                <span className="font-medium">{r.date}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs uppercase font-bold text-gray-400">Time</span>
                <span className="font-medium">{r.time}</span>
              </div>
            </div>

            <button onClick={() => requestRide(r._id)} className="mt-2 w-full bg-indigo-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-indigo-700 transition duration-300 shadow-md">
              Request Ride
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchRide;