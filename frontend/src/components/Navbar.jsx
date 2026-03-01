import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        Campus RideShare
      </h1>

      {token && (
        <div className="space-x-4">
          <Link to="/create" className="hover:text-gray-200">
            Create Ride
          </Link>
          <Link to="/search" className="hover:text-gray-200">
            Search
          </Link>
          <Link to="/requests" className="hover:text-gray-200">
            Requests
          </Link>
          <button
            onClick={logout}
            className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
