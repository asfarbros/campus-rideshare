import { useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";

function SearchRide() {
  const [area, setArea] = useState("");
  const [rides, setRides] = useState([]);

  const search = async () => {
    if (!area) {
      toast.error("Please enter an area to search for rides!");
      return;
    }

    try {
      const res = await API.get(`/rides?area=${area}`);

      if (res.data.length === 0) {
        toast.error("Rides are not available for the specified area");
      } else {
        toast.success(`${res.data.length} rides are present`);
      }

      setRides(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching rides");
    }
  };

  const requestRide = async (rideId) => {
    try {
      await API.post("/requests", { rideId });
      toast.success("Ride requested successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to request ride");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-4">
        Search Ride
      </h2>

      <div className="flex gap-3 mb-8">
        <input
          placeholder="Enter Area (e.g., Sholinganallur)"
          onChange={(e) => setArea(e.target.value)}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-700"
        />
        <button
          onClick={search}
          className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 shadow-md transition-all"
        >
          Search
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {rides.map((r) => (
          <div
            key={r._id}
            className="bg-white shadow-lg p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 transition-transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start">
              <p className="font-extrabold text-xl text-gray-800">
                {r.from} <span className="text-indigo-500 mx-2">→</span> {r.to}
              </p>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                {r.seatsAvailable} Seats
              </span>
            </div>

            <div className="flex justify-between text-gray-600 bg-gray-50 p-3 rounded-lg">
              <div className="flex flex-col">
                <span className="text-xs uppercase font-bold text-gray-400">
                  Date
                </span>
                <span className="font-medium">{r.date}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs uppercase font-bold text-gray-400">
                  Time
                </span>
                <span className="font-medium">{r.time}</span>
              </div>
            </div>

            <button
              onClick={() => requestRide(r._id)}
              className="mt-2 w-full bg-indigo-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-indigo-700 transition duration-300 shadow-md"
            >
              Request Ride
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchRide;
