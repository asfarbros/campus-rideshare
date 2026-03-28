import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import API from "../services/api";
import toast from "react-hot-toast";

function SyncClerk() {
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const hasSynced = useRef(false);

  useEffect(() => {
    const syncUser = async () => {
      if (hasSynced.current) return;
      
      try {
        if (!isLoaded) return;
        
        if (!user) {
          navigate("/");
          return;
        }

        hasSynced.current = true;
        const email = user.primaryEmailAddress?.emailAddress;
        const name = user.fullName;

        const res = await API.post("/auth/clerk-auth", { email, name });
        localStorage.setItem("token", res.data.token);
        toast.success("Authenticated successfully!");
        navigate("/dashboard");

      } catch (error) {
        console.error("Error syncing with backend:", error);
        toast.error(error.response?.data?.message || "Failed to sync user data");
        
        // Clear Clerk session on backend failure (e.g. invalid domain)
        await signOut();
        
        navigate("/");
      }
    };

    syncUser();
  }, [isLoaded, user, navigate, signOut]);

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
