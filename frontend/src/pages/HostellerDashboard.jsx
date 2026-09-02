import { useNavigate } from "react-router-dom";
import { getTravelAlerts } from "../utils/calendarUtils";

function HostellerDashboard() {
  const navigate = useNavigate();
  const travelAlerts = getTravelAlerts();

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center text-center">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">
        Hosteller Companion Finder
      </h2>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        Planning to go home for the weekend? Find campus mates traveling to the
        same city and share your journey!
      </p>

      {/* Smart Travel Alerts */}
      {travelAlerts.map((alert, index) => (
        <div 
          key={index} 
          className={`mb-8 p-4 rounded-xl shadow-sm border max-w-2xl w-full text-left flex items-start gap-4 ${
            alert.type === 'success' ? 'bg-green-50 border-green-200' : 
            alert.type === 'urgent' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="text-3xl">{alert.icon}</div>
          <div>
            <h3 className={`font-bold text-lg ${
              alert.type === 'success' ? 'text-green-800' : 
              alert.type === 'urgent' ? 'text-red-800' : 'text-blue-800'
            }`}>
              {alert.title}
            </h3>
            <p className="text-gray-700 mt-1">{alert.description}</p>
          </div>
        </div>
      ))}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full max-w-5xl">
        <button
          onClick={() => navigate("/hosteller/browse")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 px-4 rounded-xl shadow-md transition duration-200 flex flex-col items-center gap-2"
        >
          <span className="text-3xl">🔍</span>
          <span className="text-lg">Browse Posts</span>
          <span className="text-sm font-normal opacity-80">Find travel companions</span>
        </button>

        <button
          onClick={() => navigate("/hosteller/create")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-4 rounded-xl shadow-md transition duration-200 flex flex-col items-center gap-2"
        >
          <span className="text-3xl">✏️</span>
          <span className="text-lg">Post Travel Plan</span>
          <span className="text-sm font-normal opacity-80">Let others find you</span>
        </button>

        <button
          onClick={() => navigate("/hosteller/requests")}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 px-4 rounded-xl shadow-md transition duration-200 flex flex-col items-center gap-2"
        >
          <span className="text-3xl">📬</span>
          <span className="text-lg">My Requests</span>
          <span className="text-sm font-normal opacity-80">Incoming & outgoing</span>
        </button>

        <button
          onClick={() => navigate("/hosteller/my-posts")}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 px-4 rounded-xl shadow-md transition duration-200 flex flex-col items-center gap-2"
        >
          <span className="text-3xl">📋</span>
          <span className="text-lg">My Posts</span>
          <span className="text-sm font-normal opacity-80">Manage your plans</span>
        </button>

        <button
          onClick={() => navigate("/hosteller/calendar")}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-6 px-4 rounded-xl shadow-md transition duration-200 flex flex-col items-center gap-2"
        >
          <span className="text-3xl">📅</span>
          <span className="text-lg">Calendar</span>
          <span className="text-sm font-normal opacity-80">Plan by holidays</span>
        </button>
      </div>
    </div>
  );
}

export default HostellerDashboard;
