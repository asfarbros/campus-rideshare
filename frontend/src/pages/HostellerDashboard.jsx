import { useNavigate } from "react-router-dom";

function HostellerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center text-center">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">
        Hosteller Companion Finder
      </h2>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl">
        Planning to go home for the weekend? Find campus mates traveling to the
        same city and share your journey!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl">
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
      </div>
    </div>
  );
}

export default HostellerDashboard;
