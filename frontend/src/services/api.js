/**
 * API Service (FIXED)
 */

import axios from "axios";

// 🔥 Use environment variable for production and fallback to localhost for dev
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const normalizedApiUrl = rawApiUrl.replace(/\/$/, '');
const api = axios.create({
  baseURL: `${normalizedApiUrl}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  // no cookies by default; set to true only if you use cookie-based auth
  withCredentials: false,
});

// ─── Request Interceptor ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    // 🔥 Auto logout on 401
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:logout"));
    }

    return Promise.reject(new Error(message));
  }
);

// ─── Auth APIs ───────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// ─── Products ────────────────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get("/products/categories"),
  create: (data) =>
    api.post("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

// ─── Orders ──────────────────────────────────────────────────────
export const orderAPI = {
  create: (data) => api.post("/orders", data),
  getMyOrders: (params) => api.get("/orders/my", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  markPaid: (id, data) => api.put(`/orders/${id}/pay`, data),
  getAll: (params) => api.get("/orders", { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// ─── Users ───────────────────────────────────────────────────────
export const userAPI = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get("/users/stats"),
};

// ─── Payments ────────────────────────────────────────────────────
export const paymentAPI = {
  createStripeIntent: (data) =>
    api.post("/payment/stripe/create-intent", data),
  createRazorpayOrder: (data) =>
    api.post("/payment/razorpay/create-order", data),
  verifyRazorpay: (data) =>
    api.post("/payment/razorpay/verify", data),
};

export default api;