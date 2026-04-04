import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function HostellerMyPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/hosteller/posts/my");
      setPosts(res.data);
    } catch {
      toast.error("Failed to load your posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleClose = async (id) => {
    try {
      setActionId(id);
      await API.patch(`/hosteller/posts/${id}/close`);
      toast.success("Post closed");
      fetchMyPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to close post");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try {
      setActionId(id);
      await API.delete(`/hosteller/posts/${id}`);
      toast.success("Post deleted");
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete post");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <button
          onClick={() => navigate("/hosteller")}
          className="text-indigo-600 hover:underline text-sm"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-extrabold text-gray-800">My Travel Posts</h2>
        <button
          onClick={() => navigate("/hosteller/create")}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow"
        >
          + New Post
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading...</p>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">You haven't posted any travel plans yet.</p>
          <button
            onClick={() => navigate("/hosteller/create")}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="grid gap-5">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-gray-800">🏙️ {post.destination}</h3>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                      post.status === "open"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">📅 {post.travelDate}</p>
                {post.note && (
                  <p className="text-sm text-gray-500 italic">"{post.note}"</p>
                )}
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                {post.status === "open" && (
                  <button
                    onClick={() => handleClose(post._id)}
                    disabled={actionId === post._id}
                    className="flex-1 md:flex-none bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-200"
                  >
                    Close
                  </button>
                )}
                <button
                  onClick={() => handleDelete(post._id)}
                  disabled={actionId === post._id}
                  className="flex-1 md:flex-none bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HostellerMyPosts;
