import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import API from "../services/api";

function MyRides() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await API.get("/requests/my-requests");
      setRequests(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch your requested rides");
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
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-4">My Rides</h2>

      {requests.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-md text-center border border-gray-100">
          <p className="text-gray-500 text-lg">You haven't requested any rides yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {requests.map((req) => (
            <div key={req._id} className="bg-white shadow-lg p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 transition-transform hover:-translate-y-1">
              
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Driver</span>
                  <span className="font-bold text-gray-700 text-sm">
                     👤 {req.ride?.driver?.name || "Member"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                    req.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {req.status}
                  </span>
                </div>
              </div>

              {req.ride ? (
                <>
                  <div className="flex justify-between items-start">
                    <p className="font-extrabold text-xl text-gray-800 capitalize">
                      {req.ride.from} <span className="text-indigo-500 mx-2">→</span> {req.ride.to}
                    </p>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full capitalize">
                       {req.ride.vehicleType === 'bike' ? '🏍️ Bike' : '🚗 Car'}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase font-bold text-gray-400">Date</span>
                      <span className="font-medium">{req.ride.date}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs uppercase font-bold text-gray-400">Time</span>
                      <span className="font-medium">{req.ride.time}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 italic p-3 text-center">Ride no longer exists</div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyRides;
