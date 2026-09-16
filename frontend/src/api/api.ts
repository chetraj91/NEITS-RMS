import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// ATTACH JWT TOKEN TO EVERY REQUEST
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem("token");

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);

// =====================================================
// HANDLE AUTHORIZATION ERRORS
// =====================================================

api.interceptors.response.use(
  (response) =>
    response,

  (error) => {
    if (
      error.response?.status === 401
    ) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      window.location.href =
        "/login";
    }

    return Promise.reject(error);
  }
);

export default api;