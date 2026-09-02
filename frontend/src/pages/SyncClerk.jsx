import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import API from "../services/api";
import toast from "react-hot-toast";

function SyncClerk() {
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const hasSynced = useRef(false);

  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      navigate("/");
      return;
    }

    // Check if the user needs to set a password (e.g. they signed up via Google OAuth)
    if (!user.passwordEnabled && !hasSynced.current) {
      setNeedsPassword(true);
      return; // Stop sync until password is set or skipped
    }

    // If they already have a password or bypassed it, run normal sync
    const syncUser = async () => {
      if (hasSynced.current) return;
      try {
        hasSynced.current = true;
        const email = user.primaryEmailAddress?.emailAddress;
        // robustly fallback to ensure we always have a name
        const name = user.fullName || user.firstName || "User";

        const res = await API.post("/auth/clerk-auth", { clerkId: user.id, email, name });
        // Token is now managed securely by Clerk and automatically sent by our API setup.
        toast.success("Authenticated successfully!");
        navigate("/dashboard");

      } catch (error) {
        console.error("Error syncing with backend:", error);
        toast.error(error.response?.data?.message || "Failed to sync user data");
        // Clear Clerk session on backend failure
        await signOut();
        navigate("/");
      }
    };

    if (!needsPassword) {
      syncUser();
    }

  }, [isLoaded, user, navigate, signOut, needsPassword]);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (!password) return toast.error("Please enter a password");
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    
    setIsUpdating(true);
    try {
      // For users without passwords, updatePassword securely accepts a newPassword
      await user.updatePassword({ newPassword: password });
      toast.success("Password set successfully! You can use it to login later.");
      setNeedsPassword(false); // Triggers standard sync flow to proceed to Dashboard
    } catch (err) {
      toast.error(err.errors?.[0]?.message || "Failed to set password");
      setIsUpdating(false);
    }
  };

  const handleSkip = () => {
    setNeedsPassword(false); // Bypasses the password prompt
  };

  if (needsPassword) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-96 border border-gray-100 relative">
          
          <button 
            type="button" 
            onClick={() => {
              toast('Sign in cancelled', {icon: '✖️'})
              signOut();
              navigate("/");
            }} 
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold transition"
            title="Cancel Sign-in"
          >
            ✕
          </button>

          <h2 className="text-2xl font-extrabold mb-4 text-center text-gray-800">Set a Password</h2>
          <p className="text-gray-500 mb-6 text-center text-sm">
            It looks like you signed in with Google. Set a password now so you can optionally log in with just your email in the future!
          </p>
          <form onSubmit={handleSetPassword} className="space-y-4">
            <input
              type="password"
              className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {isUpdating ? "Saving..." : "Save Password & Continue"}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="w-full text-gray-400 font-semibold mt-2 hover:text-gray-600 transition"
            >
              Skip for now
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Standard Loading Screen
  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Syncing your account...</h2>
        <p className="text-gray-500 mt-2">Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
}

export default SyncClerk;
