import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
function DriverRequests() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await API.get("/requests/driver");
      setRequests(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching requests");
    }
  };

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const res = await API.get("/requests/driver");
        setRequests(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching requests");
      }
    };

    loadRequests();
  }, []);

  const updateStatus = async (requestId, status) => {
    try {
      await API.put("/requests", { requestId, status });
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error("Error updating request status");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-4">
        Driver Ride Requests
      </h2>

      {requests.length === 0 ? (
        <p className="text-gray-500 text-center py-10 text-lg">
          No requests found for your rides yet.
        </p>
      ) : (
        <div className="grid gap-6">
          {requests.map((r) => (
            <div
              key={r._id}
              className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 transition-all hover:shadow-md"
            >
              <div className="flex-1 w-full text-center md:text-left">
                <p className="text-xl font-semibold text-gray-800 mb-2">
                  Passenger: {r.passenger.name}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <span className="text-sm text-gray-500 font-medium">
                    Status:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      r.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : r.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              </div>

              {r.status === "pending" && (
                <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <button
                    onClick={() => updateStatus(r._id, "accepted")}
                    className="flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow transition duration-200"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => updateStatus(r._id, "rejected")}
                    className="flex-1 md:flex-none bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow transition duration-200"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DriverRequests;
