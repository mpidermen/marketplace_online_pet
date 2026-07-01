import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GiPawPrint } from "react-icons/gi";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Selamat datang, ${user.name}! 🐾`);
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "seller") navigate("/seller/dashboard");
      else navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login gagal";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-8 text-center">
            <div className="inline-flex bg-white/20 backdrop-blur-sm p-2 rounded-2xl mb-3">
              <img src="/LOGO.png" alt="Petopia Logo" className="h-14 w-14 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white">Masuk ke Petopia</h1>
            <p className="text-emerald-100 text-sm mt-1">Selamat datang kembali! 🐾</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="nama@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 pr-11 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3.5 text-gray-400">
                    {showPw ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Masuk...</>
                  : "Masuk"
                }
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Belum punya akun?{" "}
              <Link to="/register" className="text-emerald-600 font-semibold hover:underline">Daftar gratis</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
