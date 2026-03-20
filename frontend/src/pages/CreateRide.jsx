import { useState, useRef } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function CreateRide() {
  const [form, setForm] = useState({
    from: "",
    to: "",
    routeAreas: "",
    date: "",
    time: "",
    seatsAvailable: 1,
  });

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);

  const fromTimeoutRef = useRef(null);
  const toTimeoutRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  // 🔥 Fetch Locations (Tamil Nadu optimized)
  const fetchLocations = (query, setSuggestions, timeoutRef) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}, Tamil Nadu&format=json&countrycodes=in`,
        );

        const data = await res.json();

        // ✅ Filter Tamil Nadu safely
        const filtered = data.filter(
          (item) =>
            item.display_name &&
            item.display_name.toLowerCase().includes("tamil nadu"),
        );

        // ✅ Clean + remove duplicates
        const cleaned = filtered.map((item) => ({
          name: item.display_name.split(",")[0],
          full: item.display_name,
        }));

        const unique = [
          ...new Map(cleaned.map((item) => [item.name, item])).values(),
        ];

        setSuggestions(unique.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    }, 300);
  };

  const handleSubmit = async () => {
    if (
      !form.from ||
      !form.to ||
      !form.routeAreas ||
      !form.date ||
      !form.time ||
      !form.seatsAvailable
    ) {
      toast.error("Please fill all details");
      return;
    }

    try {
      await API.post("/rides", {
        ...form,
        routeAreas: form.routeAreas.split(",").map((a) => a.trim()),
      });

      toast.success("Ride created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error creating ride");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        Post a Ride
      </h2>

      <div className="flex flex-col gap-5">
        {/* FROM + TO */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* FROM */}
          <div className="relative w-full">
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
              placeholder="From (e.g., Tambaram)"
              value={form.from}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, from: value });
                fetchLocations(value, setFromSuggestions, fromTimeoutRef);
              }}
            />

            {fromSuggestions.length > 0 && (
              <ul className="absolute bg-white border w-full max-h-40 overflow-y-auto z-10 rounded-lg shadow">
                {fromSuggestions.map((item, i) => (
                  <li
                    key={i}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
              placeholder="To (e.g., College)"
              value={form.to}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, to: value });
                fetchLocations(value, setToSuggestions, toTimeoutRef);
              }}
            />

            {toSuggestions.length > 0 && (
              <ul className="absolute bg-white border w-full max-h-40 overflow-y-auto z-10 rounded-lg shadow">
                {toSuggestions.map((item, i) => (
                  <li
                    key={i}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
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

        {/* ROUTE AREAS */}
        <input
          className="w-full px-4 py-3 rounded-lg border border-gray-300"
          placeholder="Route Areas (comma separated)"
          onChange={(e) => setForm({ ...form, routeAreas: e.target.value })}
        />

        {/* DATE & TIME */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="date"
            min={today}
            className="w-full px-4 py-3 rounded-lg border border-gray-300"
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300"
            placeholder="Time (e.g., 08:30 AM)"
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>

        {/* SEATS */}
        <input
          type="number"
          min="1"
          className="w-full px-4 py-3 rounded-lg border border-gray-300"
          placeholder="Seats Available"
          onChange={(e) => setForm({ ...form, seatsAvailable: e.target.value })}
        />

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          className="w-full mt-2 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700"
        >
          Post Ride
        </button>
      </div>
    </div>
  );
}

export default CreateRide;
