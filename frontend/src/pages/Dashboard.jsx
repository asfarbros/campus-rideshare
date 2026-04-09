import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 relative overflow-hidden font-sans">
      
      {/* Dynamic Background Blobs */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-300/20 blur-[120px] rounded-full -top-48 -left-24 animate-pulse"></div>
      <div className="absolute w-[500px] h-[500px] bg-purple-300/20 blur-[120px] rounded-full -bottom-48 -right-24"></div>

      {/* 🔥 MAIN GLASS CONTAINER */}
      <div className="max-w-7xl mx-auto my-10 px-8 md:px-16 py-16 bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_40px_100px_rgba(79,70,229,0.15)] relative z-10 border border-white">

        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* LEFT CONTENT */}
          <div>
            <h1 className="text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
              Shared rides, <br />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Better journeys!
              </span>
            </h1>

            <p className="mt-6 text-gray-600 text-xl font-medium max-w-md leading-relaxed">
              The smartest way for students to commute. Reliable, affordable, and safe.
            </p>

            <button
              onClick={() => navigate("/dayscholar")}
              className="mt-8 bg-indigo-600 text-white px-10 py-4 rounded-2xl text-lg font-bold hover:bg-indigo-700 hover:scale-105 hover:shadow-[0_10px_30px_rgba(79,70,229,0.4)] active:scale-95 transition-all duration-300"
            >
              Find a Ride Now
            </button>

            {/* 🔥 UPDATED COLORED CARDS */}
            <div className="mt-14 grid grid-cols-2 gap-6">

              {/* Day Scholar Card */}
              <div
                onClick={() => navigate("/dayscholar")}
                className="group cursor-pointer bg-indigo-50/50 border-2 border-indigo-100/50 p-6 rounded-[2rem] shadow-sm hover:bg-indigo-600 hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex flex-col items-start gap-4">
                  <div className="bg-white p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <span className="text-2xl">🎒</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-white transition-colors">Day Scholar</h3>
                    <p className="text-xs text-indigo-600/70 mt-1 font-bold group-hover:text-indigo-100 transition-colors">Daily city commute</p>
                  </div>
                </div>
              </div>

              {/* Hosteller Card */}
              <div
                onClick={() => navigate("/hosteller")}
                className="group cursor-pointer bg-indigo-50/50 border-2 border-indigo-100/50 p-6 rounded-[2rem] shadow-sm hover:bg-indigo-600 hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex flex-col items-start gap-4">
                  <div className="bg-white p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-white transition-colors">Hosteller</h3>
                    <p className="text-xs text-indigo-600/70 mt-1 font-bold group-hover:text-indigo-100 transition-colors">Weekend trips</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE IMAGE */}
          <div className="hidden md:block relative">
            <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-90"></div>
            <img
              src="/students.png"
              alt="students ride"
              className="relative rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:rotate-1 transition-transform duration-700 w-full"
            />
          </div>

        </div>

        {/* 🔥 UPDATED BOTTOM FEATURE TILES */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">

          {[
            { icon: "🚗", title: "Daily Commute", desc: "Stress-free travel between home and campus with fellow students." },
            { icon: "🎓", title: "Student Network", desc: "Only verified university IDs allowed. Travel safely with peers." },
            { icon: "💸", title: "Save Money", desc: "Cut your travel costs in half by splitting fuel and fare prices." }
          ].map((feature, idx) => (
            <div key={idx} className="group relative p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-50/80 to-white/50 border border-indigo-100/50 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 text-left">
              {/* Animated Top Accent */}
              <div className="absolute top-0 left-10 h-1.5 w-12 bg-indigo-500 rounded-b-full group-hover:w-24 transition-all duration-500"></div>
              
              <div className="text-3xl mb-6 bg-white w-16 h-16 flex items-center justify-center rounded-2xl shadow-md border border-indigo-50 group-hover:rotate-6 transition-transform">
                {feature.icon}
              </div>
              
              <h3 className="font-extrabold text-xl text-indigo-950 mb-3">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

export default Dashboard;