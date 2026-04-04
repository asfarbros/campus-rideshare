import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function HostellerRequests() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("incoming");
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [inRes, outRes] = await Promise.all([
        API.get("/hosteller/requests/incoming"),
        API.get("/hosteller/requests/outgoing"),
      ]);
      setIncoming(inRes.data);
      setOutgoing(outRes.data);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAccept = async (id) => {
    try {
      await API.put(`/hosteller/requests/${id}/accept`);
      toast.success("Request accepted!");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept");
    }
  };

  const handleReject = async (id) => {
    try {
      await API.put(`/hosteller/requests/${id}/reject`);
      toast.success("Request rejected");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject");
    }
  };

  const renderIncomingCard = (r) => (
    <div
      key={r._id}
      className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all"
    >
      <div className="flex-1">
        <p className="font-bold text-gray-800 text-lg mb-1">
          🏙️ {r.post?.destination}
          <span className="text-sm font-normal text-gray-500 ml-2">— {r.post?.travelDate}</span>
        </p>
        <p className="text-gray-700 mb-2">
          👤 From: <span className="font-semibold text-indigo-600">{r.sender?.name}</span>
        </p>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[r.status]}`}
        >
          {r.status}
        </span>
      </div>

      {r.status === "pending" && (
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => handleAccept(r._id)}
            className="flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-lg shadow transition duration-200"
          >
            Accept
          </button>
          <button
            onClick={() => handleReject(r._id)}
            className="flex-1 md:flex-none bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg shadow transition duration-200"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );

  const renderOutgoingCard = (r) => (
    <div
      key={r._id}
      className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all"
    >
      <div className="flex-1">
        <p className="font-bold text-gray-800 text-lg mb-1">
          🏙️ {r.post?.destination}
          <span className="text-sm font-normal text-gray-500 ml-2">— {r.post?.travelDate}</span>
        </p>
        <p className="text-gray-700 mb-2">
          👤 Posted by: <span className="font-semibold text-indigo-600">{r.post?.creator?.name}</span>
        </p>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[r.status]}`}
        >
          {r.status}
        </span>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <button
          onClick={() => navigate("/hosteller")}
          className="text-indigo-600 hover:underline text-sm"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-extrabold text-gray-800">My Companion Requests</h2>
        <div />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setTab("incoming")}
          className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
            tab === "incoming"
              ? "bg-indigo-600 text-white shadow"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Incoming
          {incoming.filter((r) => r.status === "pending").length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {incoming.filter((r) => r.status === "pending").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("outgoing")}
          className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
            tab === "outgoing"
              ? "bg-indigo-600 text-white shadow"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Outgoing
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading...</p>
      ) : tab === "incoming" ? (
        incoming.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No incoming requests yet.</p>
        ) : (
          <div className="grid gap-5">{incoming.map(renderIncomingCard)}</div>
        )
      ) : outgoing.length === 0 ? (
        <p className="text-center text-gray-500 py-10">You haven't sent any requests yet.</p>
      ) : (
        <div className="grid gap-5">{outgoing.map(renderOutgoingCard)}</div>
      )}
    </div>
  );
}

export default HostellerRequests;
