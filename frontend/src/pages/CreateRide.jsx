import { useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function CreateRide() {
  const [form, setForm] = useState({
    from: "",
    to: "",
    routeAreas: "",
    date: "",
    time: "",
    seatsAvailable: 1,
  });

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async () => {
    if (
      !form.from ||
      !form.to ||
      !form.routeAreas ||
      !form.date ||
      !form.time ||
      !form.seatsAvailable
    ) {
      toast.error("Dhayavu senju ellam details um fill pannunga");
      return;
    }

    try {
      await API.post("/rides", {
        ...form,
        routeAreas: form.routeAreas.split(",").map((a) => a.trim()),
      });

      toast.success("Ride created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error creating ride");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        Post a Ride
      </h2>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition"
            placeholder="From (e.g., Tambaram)"
            onChange={(e) => setForm({ ...form, from: e.target.value })}
          />
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition"
            placeholder="To (e.g., College)"
            onChange={(e) => setForm({ ...form, to: e.target.value })}
          />
        </div>

        <input
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition"
          placeholder="Route Areas (comma separated)"
          onChange={(e) => setForm({ ...form, routeAreas: e.target.value })}
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="date"
            min={today}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition text-gray-600"
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition"
            placeholder="Time (e.g., 08:30 AM)"
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>

        <input
          type="number"
          min="1"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition"
          placeholder="Seats Available"
          onChange={(e) => setForm({ ...form, seatsAvailable: e.target.value })}
        />

        <button
          onClick={handleSubmit}
          className="w-full mt-2 bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-300"
        >
          Post Ride
        </button>
      </div>
    </div>
  );
}

export default CreateRide;
