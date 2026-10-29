import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // Prefer admin token, fall back to staff token
  const token =
    localStorage.getItem("admin_token") ||
    localStorage.getItem("staff_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin");
      localStorage.removeItem("staff_token");
      localStorage.removeItem("staff");
      localStorage.removeItem("auth_role");
    }
    return Promise.reject(error);
  },
);

export default api;