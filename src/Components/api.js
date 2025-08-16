// src/utils/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://lagos-turnup.onrender.com",
});

// --- Attach token to every request ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Handle expired tokens gracefully ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      const msg =
        error.response.data?.message?.toLowerCase() || "";

      // Only handle if token is invalid/expired
      if (msg.includes("token") || msg.includes("expired")) {
        if (isRefreshing) {
          // Wait for token refresh
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = "Bearer " + token;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Call refresh token endpoint
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token");

          const res = await axios.post(
            "https://lagos-turnup.onrender.com/auth/refresh-token",
            { refreshToken }
          );

          const newToken = res.data.token;
          localStorage.setItem("token", newToken);
          api.defaults.headers.common["Authorization"] = "Bearer " + newToken;

          processQueue(null, newToken);
          return api(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          window.location.href = "/auth";
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
