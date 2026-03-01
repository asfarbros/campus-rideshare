import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        Welcome to Campus RideShare
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div
          onClick={() => navigate("/create")}
          className="bg-white shadow-lg rounded-xl p-6 cursor-pointer hover:shadow-xl transition"
        >
          <h3 className="text-xl font-semibold mb-2">Create Ride</h3>
          <p className="text-gray-600">
            Offer available seats to fellow students.
          </p>
        </div>

        <div
          onClick={() => navigate("/search")}
          className="bg-white shadow-lg rounded-xl p-6 cursor-pointer hover:shadow-xl transition"
        >
          <h3 className="text-xl font-semibold mb-2">Search Ride</h3>
          <p className="text-gray-600">Find rides passing through your area.</p>
        </div>

        <div
          onClick={() => navigate("/requests")}
          className="bg-white shadow-lg rounded-xl p-6 cursor-pointer hover:shadow-xl transition"
        >
          <h3 className="text-xl font-semibold mb-2">Ride Requests</h3>
          <p className="text-gray-600">
            Accept or reject incoming ride requests.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
