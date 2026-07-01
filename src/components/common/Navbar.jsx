import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch, FiChevronDown, FiLogOut, FiPackage, FiGrid } from "react-icons/fi";
import { GiPawPrint } from "react-icons/gi";

export default function Navbar() {
  const { user, logout, cartCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/katalog-hewan?search=${encodeURIComponent(search)}`);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  const navLinks = [
    { label: "Hewan", to: "/katalog-hewan" },
    { label: "Produk", to: "/katalog-produk" },
  ];

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "seller") return "/seller/dashboard";
    return null;
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/LOGO.png" alt="Petopia Logo" className="h-9 w-9 object-contain" />
            <span className="text-xl font-bold text-emerald-600">Petopia</span>
          </Link>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari hewan, produk, atau merek..."
                className="w-full pl-4 pr-12 py-2.5 rounded-full border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm transition-colors"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-1.5 transition-colors">
                <FiSearch className="text-sm" />
              </button>
            </div>
          </form>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Nav links - Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.startsWith(link.to) ? "bg-emerald-50 text-emerald-600" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Cart */}
            {user?.role === "buyer" && (
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                <FiShoppingCart className="text-xl" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-gray-50 hover:bg-emerald-50 border border-gray-200 transition-colors"
                >
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt={user.name} className="w-7 h-7 rounded-full object-cover bg-emerald-100" />
                    : <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                  }
                  <span className="hidden md:block text-sm font-medium text-gray-700 max-w-24 truncate">
                    {user && user.name ? user.name.split(" ")[0] : "User"}
                  </span>                  
                  <FiChevronDown className="text-gray-400 text-xs" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="font-semibold text-sm text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    {getDashboardLink() && (
                      <Link to={getDashboardLink()} onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                        <FiGrid /> Dashboard
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                      <FiUser /> Profil Saya
                    </Link>
                    {user.role === "buyer" && (
                      <Link to="/riwayat-pesanan" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                        <FiPackage /> Riwayat Pesanan
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full transition-colors mt-1">
                      <FiLogOut /> Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-lg transition-colors hidden md:block">Masuk</Link>
                <Link to="/register" className="text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full transition-colors">Daftar</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari hewan atau produk..." className="w-full pl-4 pr-10 py-2.5 rounded-full border-2 border-gray-200 text-sm focus:outline-none focus:border-emerald-400" />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 text-white rounded-full p-1.5"><FiSearch /></button>
              </div>
            </form>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${location.pathname.startsWith(link.to) ? "bg-emerald-50 text-emerald-600" : "text-gray-600"}`}>
                {link.label}
              </Link>
            ))}
            {!user && <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600">Masuk</Link>}
          </div>
        )}
      </div>
    </nav>
  );
}
