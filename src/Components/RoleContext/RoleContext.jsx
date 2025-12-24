// src/Components/RoleContext/RoleContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import Loader from "../Loader/Loader";

const AuthContext = createContext(null);

async function fetchUserRules() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return { role: "guest", permissions: [] };
    const response = await axios.get("https://lagos-turnup-ecy5.onrender.com/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

  
    return response.data;
  } catch (error) {
    console.error("Error fetching user rules:", error);
    // Return guest if not logged in
    return { role: "guest", permissions: [] };
  }
}

export function AuthProvider({ children }) {
  const [rules, setRules] = useState(() => {
    // Try to load last known role from localStorage for instant UI render
    const savedRules = localStorage.getItem("user_rules");
    return savedRules ? JSON.parse(savedRules) : { role: "guest", permissions: [] };
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRules = async () => {
      const rulesFromBackend = await fetchUserRules();
      setRules(rulesFromBackend);
      localStorage.setItem("user_rules", JSON.stringify(rulesFromBackend));
      setLoading(false);
    };

    loadRules();
  }, []);

  if (loading) {
    return <Loader/> ;
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
