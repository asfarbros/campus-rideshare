import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import API from "../services/api";

function MyPostedRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("upcoming");

  const isUpcoming = (dateStr, timeStr) => {
    const rideDate = new Date(`${dateStr} ${timeStr}`);
    if (isNaN(rideDate.getTime())) {
      return new Date(dateStr).getTime() + 86400000 > Date.now();
    }
    return rideDate.getTime() > Date.now();
  };

  useEffect(() => {
    fetchMyPostedRides();
  }, []);

  const fetchMyPostedRides = async () => {
    try {
      console.log("Fetching my posted rides...");
      const res = await API.get("/rides/my-posted");
      console.log("Fetched rides response:", res.data);
      setRides(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch your posted rides");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-4">My Posted Rides</h2>

      <div className="flex gap-4 mb-8 bg-gray-100 p-1 rounded-xl shadow-inner w-fit">
        <button
          onClick={() => setFilterType("upcoming")}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${
            filterType === "upcoming" ? "bg-white text-indigo-600 shadow" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Upcoming Rides
        </button>
        <button
          onClick={() => setFilterType("finished")}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${
            filterType === "finished" ? "bg-white text-indigo-600 shadow" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Finished Rides
        </button>
      </div>

      {rides.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-md text-center border border-gray-100">
          <p className="text-gray-500 text-lg">You haven't posted any rides yet.</p>
        </div>
      ) : (() => {
        const filteredRides = rides.filter(r => {
          const upcoming = filterType === "upcoming" ? isUpcoming(r.date, r.time) : !isUpcoming(r.date, r.time);
          return upcoming;
        });
        
        console.log("Filtered rides:", filteredRides);

        if (filteredRides.length === 0) {
          return (
            <div className="bg-white p-8 rounded-2xl shadow-md text-center border border-gray-100">
              <p className="text-gray-500 text-lg">No {filterType} rides found.</p>
            </div>
          );
        }

        return (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredRides.map((r) => (
              <div key={r._id} className="bg-white shadow-lg p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 transform transition hover:-translate-y-1">
              
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-xs font-semibold text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full capitalize">
                    {r.vehicleType === 'bike' ? '🏍️ Bike' : '🚗 Car'}
                  </span>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                    {r.seatsAvailable} Seats Left
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
              {/* Passengers Section */}
              {r.acceptedPassengers && r.acceptedPassengers.length > 0 && (
                <div className="mt-2 pt-3 border-t border-gray-100">
                  <span className="text-xs uppercase font-bold text-gray-400 mb-2 block">Accepted Passengers</span>
                  <div className="flex flex-wrap gap-2">
                    {r.acceptedPassengers.map((p, idx) => (
                       <span key={idx} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-100">
                         👤 {p.name}
                       </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
        );
      })()}
    </div>
  );
}

export default MyPostedRides;
