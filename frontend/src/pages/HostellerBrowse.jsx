import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import API from "../services/api";
import toast from "react-hot-toast";

function HostellerBrowse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get("date") || "";

  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [filters, setFilters] = useState({ destination: "", date: initialDate });
  const [requestedPostIds, setRequestedPostIds] = useState(new Set());
  const [sendingId, setSendingId] = useState(null);

  const fetchPosts = async (activeFilters = filters) => {
    try {
      const params = {};
      if (activeFilters.destination) params.destination = activeFilters.destination;
      if (activeFilters.date) params.date = activeFilters.date;
      const res = await API.get("/hosteller/posts", { params });
      setPosts(res.data);
    } catch (err) {
      toast.error("Failed to load posts");
    }
  };

  const fetchOutgoing = async () => {
    try {
      const res = await API.get("/hosteller/requests/outgoing");
      const ids = new Set(res.data.map((r) => r.post?._id));
      setRequestedPostIds(ids);
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchOutgoing();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleSendRequest = async (postId) => {
    try {
      setSendingId(postId);
      await API.post("/hosteller/requests", { postId });
      toast.success("Request sent!");
      setRequestedPostIds((prev) => new Set([...prev, postId]));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send request");
    } finally {
      setSendingId(null);
    }
  };

  const isOwnPost = (post) => post.creator?.clerkId === user?.id;
  const alreadyRequested = (postId) => requestedPostIds.has(postId);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/hosteller")}
          className="text-indigo-600 hover:underline text-sm"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-extrabold text-gray-800">Browse Travel Posts</h2>
        <button
          onClick={() => navigate("/hosteller/create")}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow"
        >
          + Post My Plan
        </button>
      </div>

      {/* Filter bar */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-3 mb-8 border border-gray-100"
      >
        <input
          type="text"
          placeholder="Destination city"
          value={filters.destination}
          onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => {
            const empty = { destination: "", date: "" };
            setFilters(empty);
            fetchPosts(empty);
          }}
          className="text-gray-500 hover:text-gray-700 text-sm underline px-2"
        >
          Clear
        </button>
      </form>

      {/* Post cards */}
      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No travel posts found.</p>
          <p className="text-sm mt-2">Try different filters or post your own plan!</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🏙️</span>
                  <h3 className="text-xl font-bold text-gray-800">{post.destination}</h3>
                  {isOwnPost(post) && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                      Your Post
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-1">
                  📅 <span className="font-medium">{post.travelDate}</span>
                  &nbsp;&nbsp;|&nbsp;&nbsp;
                  👤 <span className="font-medium">{post.creator?.name}</span>
                </p>

                {post.note && (
                  <p className="text-sm text-gray-500 mt-2 italic">"{post.note}"</p>
                )}

                <p className="text-xs text-green-700 font-semibold mt-2">
                  ✅ {post.acceptedCount} companion{post.acceptedCount !== 1 ? "s" : ""} connected
                </p>
              </div>

              <div className="w-full md:w-auto">
                {isOwnPost(post) ? (
                  <span className="text-sm text-gray-400 italic">This is your post</span>
                ) : alreadyRequested(post._id) ? (
                  <span className="bg-yellow-100 text-yellow-700 text-sm font-semibold px-4 py-2 rounded-lg">
                    Request Sent
                  </span>
                ) : (
                  <button
                    onClick={() => handleSendRequest(post._id)}
                    disabled={sendingId === post._id}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-2 px-6 rounded-lg shadow transition duration-200"
                  >
                    {sendingId === post._id ? "Sending..." : "Send Request"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HostellerBrowse;
