import axios from "axios";

// ✅ Automatically picks local (dev) or production (Vercel) URL
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://college-erp-server-kvc4.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("erp_token") ||
    localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;