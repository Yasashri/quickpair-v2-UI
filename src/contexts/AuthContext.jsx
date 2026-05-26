import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export const AuthContext = createContext(null);

const getToken = () => localStorage.getItem("authToken");
const getAdminToken = () => localStorage.getItem("adminToken");

const getUserProfile = (user) => {
  return user?.dating_profile || user?.datingProfile || null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const profile = getUserProfile(user);

  const isAccountActive = user?.status === "active";

  const hasProfile = Boolean(profile);

  const isProfileApproved =
    profile?.status === "approved" || profile?.approved === true;

  const isProfileActive = Boolean(
    user && isAccountActive && hasProfile && isProfileApproved
  );

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
          .then((response) => {
            setUser(response.data.user);
          })
          .catch(() => {
            localStorage.removeItem("authToken");
            setUser(null);
          })
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

    const meResponse = await api.get("/me");
    setUser(meResponse.data.user);

    return response.data;
  };

  const register = async (payload) => {
    const response = await api.post("/register", payload);

    localStorage.setItem("authToken", response.data.token);

    const meResponse = await api.get("/me");
    setUser(meResponse.data.user);

    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("authToken");
      setUser(null);
      navigate("/login");
    }
  };

  const adminLogin = async (payload) => {
    const response = await api.post("/admin/login", payload);

    localStorage.setItem("adminToken", response.data.token);
    setAdmin(response.data.admin || { role: "admin" });

    return response.data;
  };

  const adminLogout = async () => {
    try {
      await api.post("/admin/logout");
    } finally {
      localStorage.removeItem("adminToken");
      setAdmin(null);
      navigate("/admin/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        admin,

        login,
        register,
        logout,
        adminLogin,
        adminLogout,

        isAuthenticated: Boolean(user),
        isAdminAuthenticated: Boolean(admin),

        isAccountActive,
        hasProfile,
        isProfileApproved,
        isProfileActive,

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