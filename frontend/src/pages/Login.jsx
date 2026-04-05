import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignIn, useUser, SignInButton } from "@clerk/clerk-react";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Forgot Password Flow States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isResetPending, setIsResetPending] = useState(false);

  // MFA Fallback Flow States
  const [mfaPending, setMfaPending] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaType, setMfaType] = useState(""); // "first" or "second"

  const navigate = useNavigate();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useUser();

  useEffect(() => {
    // If they land on Login but have a valid Clerk session, immediately sync.
    if (isSignedIn && !localStorage.getItem("token")) {
      navigate("/sync-clerk");
    } else if (isSignedIn && localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [isSignedIn, navigate]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!isLoaded) return;
    if (!email || !password) return toast.error("Please enter email and password");

    const loadingToast = toast.loading("Logging in...");
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.dismiss(loadingToast);
      } else if (result.status === "needs_first_factor" || result.status === "needs_second_factor") {
        toast.dismiss(loadingToast);
        
        const factors = result.status === "needs_second_factor" 
          ? result.supportedSecondFactors 
          : result.supportedFirstFactors;
          
        const emailCodeFactor = factors?.find(f => f.strategy === "email_code");
        
        if (emailCodeFactor) {
           if (result.status === "needs_first_factor") {
              await signIn.prepareFirstFactor({ strategy: "email_code", emailAddressId: emailCodeFactor.emailAddressId });
              setMfaType("first");
           } else {
              await signIn.prepareSecondFactor({ strategy: "email_code" });
              setMfaType("second");
           }
           setMfaPending(true);
           toast.success("Additional verification required. Code sent to your email!");
        } else if (factors?.find(f => f.strategy === "totp")) {
             toast.error("Authenticator App (TOTP) is required. Please disable it in your Clerk dashboard or contact support.");
        } else {
            console.log(result);
            toast.error("Further action required. Check console logs.");
        }
      } else {
        console.log("Incomplete SignIn Status:", result.status, result);
        toast.dismiss(loadingToast);
        toast.error(`Login incomplete. Status: ${result.status}`);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error(err);
      toast.error(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Invalid credentials");
    }
  };

  const handleMfaVerify = async (e) => {
     e.preventDefault();
     if (!mfaCode) return toast.error("Please enter the verification code");
     const loadingToast = toast.loading("Verifying code...");
     try {
       let result;
       if (mfaType === "first") {
         result = await signIn.attemptFirstFactor({ strategy: "email_code", code: mfaCode });
       } else {
         result = await signIn.attemptSecondFactor({ strategy: "email_code", code: mfaCode });
       }
       
       if (result.status === "complete") {
         await setActive({ session: result.createdSessionId });
         toast.dismiss(loadingToast);
         toast.success("Login successful!");
       } else {
         console.log(result);
         toast.dismiss(loadingToast);
         toast.error("Further action required. Code accepted but not complete.");
       }
     } catch (err) {
       toast.dismiss(loadingToast);
       toast.error(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Invalid code");
     }
  };

  const startForgotPassword = async (e) => {
    e?.preventDefault();
    if (!email) return toast.error("Please enter your email address first");
    if (!isLoaded) return;

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setIsResetPending(true);
      toast.success("Password reset code sent to your email!");
    } catch (err) {
      toast.error(err.errors?.[0]?.message || "Could not start password reset");
    }
  };

  const handleResetPassword = async (e) => {
    e?.preventDefault();
    if (!isLoaded) return;

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode,
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Password successfully reset!");
      } else {
        toast.error("Further action required. Check logs.");
      }
    } catch (err) {
      toast.error(err.errors?.[0]?.message || "Failed to reset password");
    }
  };

  if (isForgotPassword) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-96 border border-gray-100">
          <h2 className="text-2xl font-extrabold mb-4 text-center text-gray-800">Reset Password</h2>
          
          {!isResetPending ? (
            <form onSubmit={startForgotPassword} className="space-y-4">
              <p className="text-gray-500 mb-6 text-center text-sm">Enter the email associated with your account.</p>
              <input
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition"
              >
                Send Reset Code
              </button>
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="w-full text-gray-500 font-semibold mt-2 hover:text-gray-800 transition"
              >
                Cancel
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-gray-500 mb-6 text-center text-sm">Enter the code sent to {email} and your new password.</p>
              <input
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-center tracking-widest text-lg font-bold"
                placeholder="6-digit Code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
              />
              <input
                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-green-700 transition"
              >
                Reset Password & Login
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (mfaPending) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-96 border border-gray-100">
          <h2 className="text-2xl font-extrabold mb-4 text-center text-gray-800">Verification Required</h2>
          <form onSubmit={handleMfaVerify} className="space-y-4">
            <p className="text-gray-500 mb-6 text-center text-sm">We need to securely verify your login. Look out for an email with a code.</p>
            <input
              className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-center tracking-widest text-lg font-bold"
              placeholder="6-digit Code"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition"
            >
              Verify & Login
            </button>
            <button
                type="button"
                onClick={() => setMfaPending(false)}
                className="w-full text-gray-500 font-semibold mt-2 hover:text-gray-800 transition"
              >
                Cancel
              </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-96 border border-gray-100">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div>
            <input
              className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="text-right mt-1">
              <button 
                type="button" 
                onClick={() => setIsForgotPassword(true)}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-300"
          >
            Login
          </button>
        </form>

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
