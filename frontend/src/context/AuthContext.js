import { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import { API_URL as API } from "../config";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("klevercal_token"));

  const checkAuth = useCallback(async () => {
    try {
      const savedUser = localStorage.getItem("klevercal_user");
      const savedToken = localStorage.getItem("klevercal_token");

      if (!savedToken) {
        setLoading(false);
        return false;
      }

      // Verify with server
      const response = await axios.get(`${API}/auth/me`, {
        headers: savedToken !== "session" ? { Authorization: `Bearer ${savedToken}` } : {},
        withCredentials: true,
      });

      if (response.status === 200) {
        const userData = response.data;
        setUser(userData);
        setToken(savedToken);
        localStorage.setItem("klevercal_user", JSON.stringify(userData));
        setLoading(false);
        return true;
      }
    } catch (error) {
      // Clear invalid session on error (e.g., 401)
      console.error("Auth check error:", error);
      localStorage.removeItem("klevercal_user");
      localStorage.removeItem("klevercal_token");
      setUser(null);
      setToken(null);
      setLoading(false);
      return false;
    }

    setLoading(false);
    return false;
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data;

      setToken(data.token);
      localStorage.setItem("klevercal_token", data.token);
      await checkAuth();
      return data;
    } catch (error) {
      const message = error.response?.data?.detail || "Login failed";
      throw new Error(message);
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API}/auth/register`,
        { name, email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data;

      setToken(data.token);
      localStorage.setItem("klevercal_token", data.token);
      await checkAuth();
      return data;
    } catch (error) {
      const message = error.response?.data?.detail || "Registration failed";
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (e) {
      console.error("Logout error:", e);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("klevercal_token");
    localStorage.removeItem("klevercal_user");
  };



  const getAuthHeaders = () => {
    if (!token || token === "session") return {};
    return { Authorization: `Bearer ${token}` };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        login,
        register,
        logout,
        checkAuth,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
