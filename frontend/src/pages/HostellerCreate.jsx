import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

const today = new Date().toISOString().split("T")[0];

function HostellerCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ destination: "", travelDate: "", note: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.destination || !form.travelDate) {
      return toast.error("Destination and date are required");
    }
    if (form.travelDate < today) {
      return toast.error("Travel date cannot be in the past");
    }
    try {
      setLoading(true);
      await API.post("/hosteller/posts", form);
      toast.success("Travel post created!");
      navigate("/hosteller/browse");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <button
        onClick={() => navigate("/hosteller")}
        className="text-indigo-600 hover:underline text-sm mb-6 inline-block"
      >
        ← Back to Hosteller Home
      </button>

      <h2 className="text-2xl font-extrabold text-gray-800 mb-6 border-b pb-4">
        Post Your Travel Plan
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Destination City *
          </label>
          <input
            type="text"
            name="destination"
            placeholder="e.g. Chennai, Coimbatore"
            value={form.destination}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Travel Date *
          </label>
          <input
            type="date"
            name="travelDate"
            value={form.travelDate}
            min={today}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Note <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            name="note"
            placeholder="e.g. Leaving after morning classes, flexible on timing"
            value={form.note}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-2 px-6 rounded-lg shadow transition duration-200"
        >
          {loading ? "Posting..." : "Post Travel Plan"}
        </button>
      </form>
    </div>
  );
}

export default HostellerCreate;
