import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const user = localStorage.getItem("petopia_user");
  if (user) {
    const token = JSON.parse(user).token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const isAuthEndpoint = err.config?.url?.includes("/auth/login") || err.config?.url?.includes("/auth/register");
    if (err.response?.status === 401 && !isAuthEndpoint) {
      // Sesi/token tidak valid lagi (bukan kegagalan saat mencoba login/register) -> auto logout
      if (localStorage.getItem("petopia_user")) {
        localStorage.removeItem("petopia_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// ==================== AUTH ====================
export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (data) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
};

// ==================== USERS ====================
export const userService = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
};

// ==================== CATEGORIES ====================
export const categoryService = {
  getAll: () => api.get("/categories"),
  create: (data) => api.post("/categories", data),
};

// ==================== PETS ====================
export const petService = {
  getAll: (params) => api.get("/pets", { params }),
  getById: (id) => api.get(`/pets/${id}`),
  create: (data) => api.post("/pets", data),
  update: (id, data) => api.put(`/pets/${id}`, data),
  delete: (id) => api.delete(`/pets/${id}`),
  getMyPets: (params) => api.get("/seller/pets", { params }),
};

// ==================== PRODUCTS ====================
export const productService = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getMyProducts: (params) => api.get("/seller/products", { params }),
};

// ==================== CART ====================
export const cartService = {
  get: () => api.get("/cart"),
  add: (data) => api.post("/cart", data),
  updateQty: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete("/cart"),
};

// ==================== ORDERS ====================
export const settingsService = {
  getPublic: () => api.get("/settings"),
};

export const orderService = {
  create: (data) => api.post("/orders", data),
  getMyOrders: (params) => api.get("/orders", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getSellerOrders: (params) => api.get("/seller/orders", { params }),
  getSellerStats: () => api.get("/seller/stats"),
  updateStatus: (id, status) => api.put(`/seller/orders/${id}/status`, { status }),
};

// ==================== PAYMENTS ====================
export const paymentService = {
  getById: (id) => api.get(`/payments/${id}`),
  getByOrder: (orderId) => api.get(`/payments/order/${orderId}`),
  update: (id, data) => api.put(`/payments/${id}`, data),
};

// ==================== REVIEWS ====================
export const reviewService = {
  create: (data) => api.post("/reviews", data),
  getByProduct: (id, params) => api.get(`/reviews/product/${id}`, { params }),
  getByPet: (id, params) => api.get(`/reviews/pet/${id}`, { params }),
  getMine: () => api.get("/reviews/mine"),
};

// ==================== ADMIN ====================
export const adminService = {
  getStats: () => api.get("/admin/dashboard"),
  getEarnings: () => api.get("/admin/earnings"),
  getUsers: (params) => api.get("/admin/users", { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getOrders: (params) => api.get("/admin/orders", { params }),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  getAllProducts: (params) => api.get("/admin/products", { params }),
  getAllPets: (params) => api.get("/admin/pets", { params }),
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (data) => api.put("/admin/settings", data),
};

// ==================== UPLOAD ====================
export const uploadService = {
  // Upload satu file gambar (avatar / foto produk / foto hewan) dari galeri device.
  // Content-Type sengaja tidak diset manual supaya browser otomatis menambahkan
  // boundary multipart/form-data yang benar (override default header JSON di atas).
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/upload/image", formData, {
      headers: { "Content-Type": undefined },
    });
  },
};

export default api;