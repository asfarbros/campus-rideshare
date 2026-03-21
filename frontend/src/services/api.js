import axios from "axios";

const API = axios.create({
    // Automatically use localhost during development, and Render during Vercel deployment
    baseURL: import.meta.env.MODE === "development" 
        ? "http://localhost:5000/api" 
        : "https://campus-rideshare-eiz9.onrender.com/api"
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = token;
    }
    return req;
});

export default API;