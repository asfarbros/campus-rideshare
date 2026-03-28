import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateRide from "./pages/CreateRide";
import SearchRide from "./pages/SearchRide";
import DriverRequests from "./pages/DriverRequests";
import DayScholarDashboard from "./pages/DayScholarDashboard";
import HostellerDashboard from "./pages/HostellerDashboard";
import SyncClerk from "./pages/SyncClerk";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-r from-blue-200 via-indigo-300 to-purple-200 bg-[length:200%_200%] animate-gradient-x flex flex-col">
        <Toaster position="top-center" />
        <Navbar />
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
            <Route path="/dayscholar" element={<DayScholarDashboard />} />
            <Route path="/hosteller" element={<HostellerDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
