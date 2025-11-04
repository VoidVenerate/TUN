// src/Components/RoleContext/RoleContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import Loader from "../Loader/Loader";

const AuthContext = createContext(null);

async function fetchUserRules() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      // No token → return guest instantly
      return { role: "guest", permissions: [] };
    }

    const response = await axios.get("https://lagos-turnup.onrender.com/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching user rules:", error);
    return { role: "guest", permissions: [] };
  }
}

export function AuthProvider({ children }) {
  const [rules, setRules] = useState(() => {
    const savedRules = localStorage.getItem("user_rules");
    return savedRules
      ? JSON.parse(savedRules)
      : { role: "guest", permissions: [] };
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUserRules = async () => {
      const token = localStorage.getItem("token");

      // If user has no token, skip backend call
      if (!token) {
        setRules({ role: "guest", permissions: [] });
        return;
      }

      setLoading(true);
      try {
        const rulesFromBackend = await fetchUserRules();
        setRules(rulesFromBackend);
        localStorage.setItem("user_rules", JSON.stringify(rulesFromBackend));
      } catch (error) {
        console.error("Failed to load user rules:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserRules();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider value={{ rules, setRules }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
