import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import API from "../services/api";

function MyPostedRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPostedRides();
  }, []);

  const fetchMyPostedRides = async () => {
    try {
      const res = await API.get("/rides/my-posted");
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

      {rides.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-md text-center border border-gray-100">
          <p className="text-gray-500 text-lg">You haven't posted any rides yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {rides.map((r) => (
            <div key={r._id} className="bg-white shadow-lg p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 transition-transform hover:-translate-y-1">
              
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

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPostedRides;
