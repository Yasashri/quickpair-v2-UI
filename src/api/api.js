import axios from "axios";

const api = axios.create({
  baseURL: "https://api.quickpair.ca/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  const authToken = localStorage.getItem("authToken");

  const isAdminRoute = config.url?.startsWith("/admin");

  const token = isAdminRoute
    ? adminToken || authToken
    : authToken || adminToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      const isAdminRoute = requestUrl.startsWith("/admin");

      if (isAdminRoute) {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin/login";
      } else {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;