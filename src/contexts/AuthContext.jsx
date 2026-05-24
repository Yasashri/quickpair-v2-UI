import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export const AuthContext = createContext(null);

const getToken = () => localStorage.getItem("authToken");
const getAdminToken = () => localStorage.getItem("adminToken");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    const adminToken = getAdminToken();

    if (!token && !adminToken) {
      setLoading(false);
      return;
    }

    const requests = [];

    if (token) {
      requests.push(
        api
          .get("/me")
          .then((response) => setUser(response.data.user))
          .catch(() => {
            localStorage.removeItem("authToken");
            setUser(null);
          }),
      );
    }

    if (adminToken) {
      setAdmin({ role: "admin" });
    }

    Promise.all(requests).finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const response = await api.post("/login", payload);
    localStorage.setItem("authToken", response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (payload) => {
    const response = await api.post("/register", payload);
    localStorage.setItem("authToken", response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    await api.post("/logout");
    localStorage.removeItem("authToken");
    setUser(null);
    navigate("/login");
  };

  const adminLogin = async (payload) => {
    const response = await api.post("/admin/login", payload);
    localStorage.setItem("adminToken", response.data.token);
    setAdmin(response.data.admin);
    return response.data;
  };

  const adminLogout = async () => {
    await api.post("/admin/logout");
    localStorage.removeItem("adminToken");
    setAdmin(null);
    navigate("/admin/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        login,
        register,
        logout,
        adminLogin,
        adminLogout,
        isAuthenticated: Boolean(user),
        isAdminAuthenticated: Boolean(admin),
        isReady: !loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
