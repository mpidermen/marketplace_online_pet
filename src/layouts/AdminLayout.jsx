import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GiPawPrint } from "react-icons/gi";
import { FiGrid, FiUsers, FiPackage, FiShoppingBag, FiBarChart2, FiLogOut, FiMenu, FiUser, FiSettings, FiDollarSign } from "react-icons/fi";
import { useState } from "react";

const adminNav = [
  { label: "Dashboard", icon: FiGrid, to: "/admin/dashboard" },
  { label: "Kelola User", icon: FiUsers, to: "/admin/users" },
  { label: "Kelola Seller", icon: FiUsers, to: "/admin/sellers" },
  { label: "Kelola Produk", icon: FiShoppingBag, to: "/admin/produk" },
  { label: "Kelola Order", icon: FiPackage, to: "/admin/orders" },
  { label: "Statistik", icon: FiBarChart2, to: "/admin/statistik" },
  { label: "Keuntungan", icon: FiDollarSign, to: "/admin/earnings" },
  { label: "Pengaturan", icon: FiSettings, to: "/admin/settings" },
  { label: "Profil Saya", icon: FiUser, to: "/profile" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2">
          <img src="/LOGO.png" alt="Petopia Logo" className="h-9 w-9 object-contain" />
          <span className="text-lg font-bold text-white">Petopia</span>
        </Link>
        <p className="text-xs text-gray-400 mt-1 ml-1">Admin Panel</p>
      </div>
      <Link to="/profile" className="block p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
        <div className="flex items-center gap-3">
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            : <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">{user?.name ? user.name.charAt(0).toUpperCase() : "A"}</div>
          }
          <div>
            <p className="text-sm font-semibold text-white truncate max-w-36">{user?.name}</p>
            <p className="text-xs text-emerald-400 font-medium">Admin</p>
          </div>
        </div>
      </Link>
      <nav className="p-3 flex-1">
        {adminNav.map(({ label, icon: Icon, to }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors ${location.pathname === to ? "bg-emerald-500 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
          >
            <Icon className="text-base" /> {label}
          </Link>
        ))}
      </nav>
      <div className="p-3">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/30 w-full transition-colors">
          <FiLogOut /> Keluar
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className="hidden md:flex flex-col w-60 bg-gray-900 fixed top-0 bottom-0 overflow-y-auto">
        <SidebarContent />
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 flex flex-col">
            <SidebarContent />
          </div>
        </div>
      )}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 md:hidden sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><FiMenu className="text-xl" /></button>
          <span className="font-bold text-gray-800">Admin Panel</span>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}