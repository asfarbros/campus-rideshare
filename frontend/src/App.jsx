import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthenticateWithRedirectCallback, useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import API from "./services/api";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateRide from "./pages/CreateRide";
import SearchRide from "./pages/SearchRide";
import DriverRequests from "./pages/DriverRequests";
import DayScholarDashboard from "./pages/DayScholarDashboard";
import HostellerDashboard from "./pages/HostellerDashboard";
import HostellerCreate from "./pages/HostellerCreate";
import HostellerBrowse from "./pages/HostellerBrowse";
import HostellerRequests from "./pages/HostellerRequests";
import HostellerMyPosts from "./pages/HostellerMyPosts";
import SyncClerk from "./pages/SyncClerk";
import MyRides from "./pages/MyRides";
import MyPostedRides from "./pages/MyPostedRides";
import MyProfile from "./pages/MyProfile";

function ApiSetup({ children }) {
  const { getToken } = useAuth();

  useEffect(() => {
    const interceptor = API.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => API.interceptors.request.eject(interceptor);
  }, [getToken]);

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <ApiSetup>
        <div className="min-h-screen bg-gradient-to-r from-blue-200 via-indigo-300 to-purple-200 bg-[length:200%_200%] animate-gradient-x flex flex-col">
        <Toaster position="top-center" />
        <Navbar />
        <Chatbot />
        <main className="flex-grow p-6 max-w-6xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/sso-callback" element={
              <AuthenticateWithRedirectCallback 
                signInFallbackRedirectUrl="/sync-clerk"
                signUpFallbackRedirectUrl="/sync-clerk"
                forceRedirectUrl="/sync-clerk"
              />
            } />
            <Route path="/sync-clerk" element={<SyncClerk />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreateRide />} />
            <Route path="/search" element={<SearchRide />} />
            <Route path="/requests" element={<DriverRequests />} />
            <Route path="/my-rides" element={<MyRides />} />
            <Route path="/my-posted-rides" element={<MyPostedRides />} />
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/dayscholar" element={<DayScholarDashboard />} />
            <Route path="/hosteller" element={<HostellerDashboard />} />
            <Route path="/hosteller/create" element={<HostellerCreate />} />
            <Route path="/hosteller/browse" element={<HostellerBrowse />} />
            <Route path="/hosteller/requests" element={<HostellerRequests />} />
            <Route path="/hosteller/my-posts" element={<HostellerMyPosts />} />
          </Routes>
        </main>
      </div>
      </ApiSetup>
    </BrowserRouter>
  );
}

export default App;
