import { createContext, useContext, useState, useCallback, useEffect } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
      const response = await fetch(`${API}/auth/me`, {
        headers: savedToken !== "session" ? { Authorization: `Bearer ${savedToken}` } : {},
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setToken(savedToken);
        localStorage.setItem("klevercal_user", JSON.stringify(userData));
        setLoading(false);
        return true;
      } else {
        // Clear invalid session
        localStorage.removeItem("klevercal_user");
        localStorage.removeItem("klevercal_token");
        setUser(null);
        setToken(null);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setLoading(false);
      return false;
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const response = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    const data = await response.json();
    setUser({ user_id: data.user_id, email: data.email, name: data.name });
    setToken(data.token);
    localStorage.setItem("klevercal_token", data.token);
    localStorage.setItem("klevercal_user", JSON.stringify({ user_id: data.user_id, email: data.email, name: data.name }));
    return data;
  };

  const register = async (name, email, password) => {
    const response = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Registration failed");
    }

    const data = await response.json();
    setUser({ user_id: data.user_id, email: data.email, name: data.name });
    setToken(data.token);
    localStorage.setItem("klevercal_token", data.token);
    localStorage.setItem("klevercal_user", JSON.stringify({ user_id: data.user_id, email: data.email, name: data.name }));
    return data;
  };

  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout error:", e);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("klevercal_token");
    localStorage.removeItem("klevercal_user");
  };

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const loginWithGoogle = () => {
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
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
        loginWithGoogle,
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
