import axios from "axios";

const API = axios.create({
    // Automatically use localhost during development, and Render during Vercel deployment
    baseURL: import.meta.env.MODE === "development" 
        ? "http://localhost:5000/api" 
        : "https://campus-rideshare-eiz9.onrender.com/api"
});

// Token interception is now handled by ApiSetup component in App.jsx
// which automatically injects the Clerk session token.

export default API;