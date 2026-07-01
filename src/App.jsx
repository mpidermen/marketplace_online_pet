import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

// Layouts
import MainLayout from "./layouts/MainLayout";
import SellerLayout from "./layouts/SellerLayout";
import AdminLayout from "./layouts/AdminLayout";

// Route guards
import { PrivateRoute, BuyerRoute, SellerRoute, AdminRoute, GuestRoute } from "./routes/ProtectedRoute";

// Buyer pages
import HomePage from "./pages/buyer/HomePage";
import LoginPage from "./pages/buyer/LoginPage";
import RegisterPage from "./pages/buyer/RegisterPage";
import KatalogHewanPage from "./pages/buyer/KatalogHewanPage";
import KatalogProdukPage from "./pages/buyer/KatalogProdukPage";
import DetailHewanPage from "./pages/buyer/DetailHewanPage";
import DetailProdukPage from "./pages/buyer/DetailProdukPage";
import CartPage from "./pages/buyer/CartPage";
import CheckoutPage from "./pages/buyer/CheckoutPage";
import RiwayatPesananPage from "./pages/buyer/RiwayatPesananPage";
import ProfilePage from "./pages/buyer/ProfilePage";

// Seller pages
import SellerDashboardPage from "./pages/seller/SellerDashboardPage";
import SellerKelolaPetPage from "./pages/seller/SellerKelolaPetPage";
import SellerFormPetPage from "./pages/seller/SellerFormPetPage";
import SellerKelolaProdukPage from "./pages/seller/SellerKelolaProdukPage";
import SellerFormProdukPage from "./pages/seller/SellerFormProdukPage";
import SellerPesananPage from "./pages/seller/SellerPesananPage";

// Admin pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminSellersPage from "./pages/admin/AdminSellersPage";
import AdminProdukPage from "./pages/admin/AdminProdukPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminStatistikPage from "./pages/admin/AdminStatistikPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminEarningsPage from "./pages/admin/AdminEarningsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: "12px", fontFamily: "Inter, sans-serif", fontSize: "14px" },
            success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
          }}
        />
        <Routes>
          {/* ============ PUBLIC / BUYER ROUTES ============ */}
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="katalog-hewan" element={<KatalogHewanPage />} />
            <Route path="katalog-produk" element={<KatalogProdukPage />} />
            <Route path="hewan/:id" element={<DetailHewanPage />} />
            <Route path="produk/:id" element={<DetailProdukPage />} />

            {/* Auth */}
            <Route path="login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

            {/* Buyer only */}
            <Route path="cart" element={<BuyerRoute><CartPage /></BuyerRoute>} />
            <Route path="checkout" element={<BuyerRoute><CheckoutPage /></BuyerRoute>} />
            <Route path="riwayat-pesanan" element={<BuyerRoute><RiwayatPesananPage /></BuyerRoute>} />
            <Route path="profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          </Route>

          {/* ============ SELLER ROUTES ============ */}
          <Route path="seller" element={<SellerRoute><SellerLayout /></SellerRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SellerDashboardPage />} />
            <Route path="hewan" element={<SellerKelolaPetPage />} />
            <Route path="hewan/tambah" element={<SellerFormPetPage />} />
            <Route path="hewan/edit/:id" element={<SellerFormPetPage />} />
            <Route path="produk" element={<SellerKelolaProdukPage />} />
            <Route path="produk/tambah" element={<SellerFormProdukPage />} />
            <Route path="produk/edit/:id" element={<SellerFormProdukPage />} />
            <Route path="pesanan" element={<SellerPesananPage />} />
          </Route>

          {/* ============ ADMIN ROUTES ============ */}
          <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="sellers" element={<AdminSellersPage />} />
            <Route path="produk" element={<AdminProdukPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="statistik" element={<AdminStatistikPage />} />
            <Route path="earnings" element={<AdminEarningsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-8xl mb-4">🐾</p>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
                <p className="text-gray-500 mb-6">Halaman tidak ditemukan</p>
                <a href="/" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-full transition-colors inline-block">
                  Kembali ke Beranda
                </a>
              </div>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}