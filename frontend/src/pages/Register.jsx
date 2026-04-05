import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignUp, useUser, SignInButton } from "@clerk/clerk-react";
import toast from "react-hot-toast";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [photo, setPhoto] = useState(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const photoUploaded = useRef(false);

  const navigate = useNavigate();
  const { isLoaded: isSignUpLoaded, signUp, setActive } = useSignUp();
  const { isLoaded: isUserLoaded, user, isSignedIn } = useUser();

  // Effect to handle sign up completion and photo upload
  useEffect(() => {
    if (isSignedIn && user) {
      if (photo && !photoUploaded.current) {
        photoUploaded.current = true;
        const uploadPhoto = async () => {
          const loadingToast = toast.loading("Uploading profile picture...");
          try {
            await user.setProfileImage({ file: photo });
            toast.dismiss(loadingToast);
            toast.success("Profile picture updated!");
          } catch (e) {
            toast.dismiss(loadingToast);
            toast.error("Failed to upload profile picture.");
          } finally {
            navigate("/sync-clerk");
          }
        };
        uploadPhoto();
      } else if (!photo) {
        navigate("/sync-clerk");
      }
    }
  }, [isSignedIn, user, photo, navigate]);

  const handleRegister = async () => {
    if (!isSignUpLoaded) return;
    
    // Custom validation
    if (!form.name || !form.email || !form.password) {
      return toast.error("Please fill in all details");
    }

    try {
      const parts = form.name.trim().split(" ");
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ");

      await signUp.create({
        emailAddress: form.email,
        password: form.password,
        firstName,
        lastName
      });

      // Prepare email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      toast.success("Verification code sent to your email!");
    } catch (err) {
      toast.error(err.errors?.[0]?.message || "Error starting registration");
    }
  };

  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!isSignUpLoaded) return;
    setIsVerifying(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      if (completeSignUp.status !== "complete") {
        console.log(JSON.stringify(completeSignUp, null, 2));
      }
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        if (!photo) {
           navigate("/sync-clerk");
        } else {
           toast.loading("Registration complete. Finalizing profile picture...");
        }
      }
    } catch (err) {
      if (err.errors?.[0]?.code === "form_password_pwned") {
         toast.error("Password is too weak or commonly used.");
      } else if (err.errors?.[0]?.message?.includes("already verified")) {
         toast.success("Already verified. Logging you in...");
         navigate("/sync-clerk");
      } else {
         toast.error(err.errors?.[0]?.message || "Invalid verification code");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(file);
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      setIsCameraActive(true);
    } catch (err) {
      toast.error("Camera access denied or unavailable");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
      setPhoto(file);
      stopCamera();
    }, 'image/jpeg');
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // If pending verification, show OTP form
  if (pendingVerification) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-96 border border-gray-100">
          <h2 className="text-2xl font-extrabold mb-4 text-center text-gray-800">Verify Email</h2>
          <p className="text-gray-500 mb-6 text-center text-sm">Enter the 6-digit code sent to your email.</p>
          <form onSubmit={handleVerify}>
            <input
              className="w-full border border-gray-300 p-3 mb-5 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-center tracking-widest text-lg font-bold"
              placeholder="Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {isVerifying ? "Verifying..." : "Verify & Complete Registration"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[70vh] py-10">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-[400px] border border-gray-100">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">Register</h2>

        {/* Profile Picture Section */}
        <div className="mb-6 flex flex-col items-center">
          <label className="text-sm font-semibold text-gray-600 mb-2">Profile Picture (Optional)</label>
          {photo ? (
            <div className="relative">
              <img src={URL.createObjectURL(photo)} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100" />
              <button 
                onClick={() => setPhoto(null)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 text-xs w-6 h-6 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="w-full flex gap-2">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button 
                onClick={() => fileInputRef.current.click()}
                className="flex-1 bg-gray-50 text-indigo-600 py-2 rounded-lg font-semibold border border-indigo-100 hover:bg-indigo-50 text-sm transition"
              >
                Upload File
              </button>
              <button 
                onClick={startCamera}
                className="flex-1 bg-gray-50 text-gray-600 py-2 rounded-lg font-semibold border border-gray-200 hover:bg-gray-100 text-sm transition"
              >
                Use Camera
              </button>
            </div>
          )}
          
          {/* Camera popup */}
          <div className={`mt-3 w-full space-y-2 bg-gray-100 p-2 rounded-lg ${isCameraActive ? 'block' : 'hidden'}`}>
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg bg-black"></video>
            <div className="flex gap-2">
              <button onClick={capturePhoto} className="flex-1 bg-green-500 text-white font-bold py-1 rounded hover:bg-green-600 text-sm transition">Snap</button>
              <button onClick={stopCamera} className="flex-1 bg-red-500 text-white font-bold py-1 rounded hover:bg-red-600 text-sm transition">Cancel</button>
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
        </div>

        <input
          className="w-full border border-gray-300 p-3 mb-4 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="w-full border border-gray-300 p-3 mb-4 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          placeholder="Email Address"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="w-full border border-gray-300 p-3 mb-6 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-300"
        >
          Register
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
          <span className="text-gray-600">Already have an account? </span>
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-800 font-bold transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
