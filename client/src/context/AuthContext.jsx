// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { request } from "../api/client";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const data = await request("/auth/me");
      setUser(data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) fetchMe();
    else setLoading(false);
  }, []);

  const login = async (payload) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    localStorage.setItem("accessToken", data.accessToken);
    setUser(data.user);
  };

  const register = async (payload) => {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    localStorage.setItem("accessToken", data.accessToken);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  const updateUser = (changes) => setUser(prev => ({ ...prev, ...changes }));

  if (loading) return null; // or a global spinner

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}





/*
// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { request } from "../api/client";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const data = await request("/auth/me");
      setUser(data);
    } catch {
      logout();   // redirect happens naturally via AuthGate
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) fetchMe();
    else setLoading(false);
  }, []);

  const login = async (payload) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    localStorage.setItem("accessToken", data.accessToken);
    setUser(data.user);
  };

  const register = async (payload) => {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    localStorage.setItem("accessToken", data.accessToken);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
*/

