import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center">
      <h2 className="text-4xl font-extrabold mb-12 text-gray-800 text-center">
        Welcome to Campus RideShare
        <span className="block text-lg font-normal text-gray-500 mt-2">
          Choose your category to continue
        </span>
      </h2>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl px-4">
        {/* Day Scholar Button */}
        <div
          onClick={() => navigate("/dayscholar")}
          className="flex-1 bg-white shadow-xl rounded-2xl p-8 cursor-pointer hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center group"
        >
          <div className="bg-indigo-100 p-4 rounded-full mb-4 group-hover:bg-indigo-600 transition-colors">
            <span className="text-4xl group-hover:text-white transition-colors">
              🎒
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-indigo-900">
            Day Scholar
          </h3>
          <p className="text-gray-600">
            Find or offer rides to commute between your home and campus easily.
          </p>
        </div>

        {/* Hosteller Button */}
        <div
          onClick={() => navigate("/hosteller")}
          className="flex-1 bg-white shadow-xl rounded-2xl p-8 cursor-pointer hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center group"
        >
          <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-600 transition-colors">
            <span className="text-4xl group-hover:text-white transition-colors">
              🏢
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-green-900">Hosteller</h3>
          <p className="text-gray-600">
            Find travel companions for your trips during weekends or holidays.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
