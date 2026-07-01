import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GiPawPrint } from "react-icons/gi";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "", role: "buyer" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Password tidak cocok!"); return; }
    if (form.password.length < 6) { toast.error("Password minimal 6 karakter!"); return; }
    setLoading(true);
    try {
      const user = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });
      toast.success(`Akun berhasil dibuat! Selamat datang, ${user.name}! 🎉`);
      if (form.role === "seller") navigate("/seller/dashboard");
      else navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Registrasi gagal";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-8 text-center">
            <div className="inline-flex bg-white/20 backdrop-blur-sm p-2 rounded-2xl mb-3">
              <img src="/LOGO.png" alt="Petopia Logo" className="h-14 w-14 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white">Daftar di Petopia</h1>
            <p className="text-emerald-100 text-sm mt-1">Gratis dan mudah! 🐾</p>
          </div>

          <div className="p-8">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                { value: "buyer", label: "🛒 Pembeli", desc: "Beli hewan & produk" },
                { value: "seller", label: "🏪 Penjual", desc: "Jual hewan & produk" }
              ].map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, role: r.value }))}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${form.role === r.value ? "border-emerald-500 bg-emerald-50" : "border-gray-200"}`}
                >
                  <p className="font-semibold text-sm">{r.label}</p>
                  <p className="text-xs text-gray-400">{r.desc}</p>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {form.role === "seller" ? "Nama Toko" : "Nama Lengkap"}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder={form.role === "seller" ? "Toko Hewan Sejahtera" : "Budi Santoso"}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="nama@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">No. HP</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min. 6 karakter"
                    required
                    className="w-full px-4 py-3 pr-11 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3.5 text-gray-400">
                    {showPw ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Konfirmasi Password</label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Ulangi password"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Mendaftar...</>
                  : "Daftar Sekarang"
                }
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Masuk di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
