import React, { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

function MyProfile() {
  const { isLoaded, user } = useUser();
  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (!isLoaded || !user) {
    return <div className="text-center py-20 animate-pulse text-indigo-600 font-bold">Loading Profile...</div>;
  }

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const parts = name.trim().split(" ");
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ");
      
      await user.update({ firstName, lastName });
      
      if (email !== user.primaryEmailAddress?.emailAddress) {
        toast("Note: To change your primary email, please use the Clerk Account Portal for email verification.", { icon: 'ℹ️' });
      } else {
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      toast.error(err.errors?.[0]?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      return toast.error("Please fill out both password fields");
    }
    setIsUpdating(true);
    try {
      await user.updatePassword({ currentPassword, newPassword });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.errors?.[0]?.message || "Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  // Picture handling
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await user.setProfileImage({ file });
      toast.success("Profile picture updated!");
    } catch(err) {
      toast.error(err.errors?.[0]?.message || "Failed to upload picture");
    }
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      setIsCameraActive(true);
    } catch (err) {
      toast.error("Camera access denied or unavailable. Please check permissions.");
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    
    // Turn off camera IMMEDIATELY after snapping picture
    stopCamera();
    
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
      try {
        const loadingToast = toast.loading("Uploading photo...");
        await user.setProfileImage({ file });
        toast.dismiss(loadingToast);
        toast.success("Profile picture captured and updated!");
      } catch(err) {
        toast.dismiss();
        toast.error("Failed to upload captured photo");
      }
    }, 'image/jpeg');
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-indigo-50">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">Profile Settings</h2>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Left Column: Picture */}
        <div className="flex flex-col items-center space-y-4 md:w-1/3">
          <div className="relative">
            <img 
              src={user.imageUrl} 
              alt="Profile" 
              className="w-48 h-48 rounded-full object-cover border-4 border-indigo-100 shadow-lg"
            />
          </div>
          
          <div className="flex flex-col w-full space-y-3 mt-4">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <button 
              onClick={() => fileInputRef.current.click()}
              className="w-full bg-indigo-50 text-indigo-700 py-3 rounded-xl font-bold shadow-sm hover:bg-indigo-100 transition duration-300"
            >
              Upload Photo
            </button>
            {!isCameraActive && (
              <button 
                onClick={startCamera}
                className="w-full bg-white text-gray-700 py-3 rounded-xl font-bold shadow-sm border border-gray-200 hover:bg-gray-50 transition duration-300"
              >
                Take a Picture
              </button>
            )}
            
            <div className={`w-full space-y-3 relative bg-gray-50 p-2 rounded-xl ${isCameraActive ? 'block' : 'hidden'}`}>
              <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg object-cover shadow-sm bg-black"></video>
              <div className="flex gap-2">
                <button onClick={capturePhoto} className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600 shadow-sm transition">Snap</button>
                <button onClick={stopCamera} className="flex-1 bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600 shadow-sm transition">Cancel</button>
              </div>
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
          </div>
        </div>

        {/* Right Column: Fields */}
        <div className="flex-1 space-y-8">
          
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition shadow-sm"
              />
            </div>

            <button 
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50 transition duration-300"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <hr className="my-8 border-gray-200" />

          <div className="space-y-5 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
            <div className="space-y-4 pt-2">
              <input 
                type="password" 
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:outline-none transition shadow-sm"
              />
              <input 
                type="password" 
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:outline-none transition shadow-sm"
              />
              <button 
                onClick={handleUpdatePassword}
                disabled={isUpdating}
                className="bg-gray-800 text-white font-bold py-3 px-8 rounded-xl shadow border border-transparent hover:bg-gray-900 disabled:opacity-50 transition duration-300 w-full sm:w-auto mt-2"
              >
                Update Password
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default MyProfile;
