import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, SignInButton } from "@clerk/clerk-react";
import API from "../services/api";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    // If they land on Login but have a valid Clerk session, immediately sync.
    if (isLoaded && isSignedIn && !localStorage.getItem("token")) {
      navigate("/sync-clerk");
    }
  }, [isLoaded, isSignedIn, navigate]);

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Wrong password,try again!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-96 border border-gray-100">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
          Login
        </h2>

        <input
          className="w-full border border-gray-300 p-3 mb-5 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border border-gray-300 p-3 mb-6 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-300"
        >
          Login
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <SignInButton mode="modal" forceRedirectUrl="/sync-clerk" signUpForceRedirectUrl="/sync-clerk">
          <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-300">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5"/>
            Sign in with Google
          </button>
        </SignInButton>

        <div className="mt-6 text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <Link
            to="/register"
            className="text-indigo-600 hover:text-indigo-800 font-bold transition"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
