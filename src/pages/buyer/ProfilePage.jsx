import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/api";
import { ImageUploadField } from "../../components/common/UIComponents";
import { FiUser, FiMail, FiPhone, FiEdit2, FiCheck, FiMapPin } from "react-icons/fi";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    avatar_url: user?.avatar_url || "",
    address: user?.address || "",
    city: user?.city || "",
    postal_code: user?.postal_code || "",
  });

  const [changingPassword, setChangingPassword] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwForm, setPwForm] = useState({ password: "", new_password: "", confirm_password: "" });

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await userService.updateProfile(form);
      updateUser(res.data); // refresh data user di seluruh aplikasi (navbar, dsb)
      toast.success("Profil berhasil diperbarui!");
      setEditing(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal memperbarui profil.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.password || !pwForm.new_password || !pwForm.confirm_password) {
      toast.error("Semua kolom password wajib diisi.");
      return;
    }
    if (pwForm.new_password.length < 6) {
      toast.error("Password baru minimal 6 karakter.");
      return;
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error("Konfirmasi password baru tidak cocok.");
      return;
    }
    setPwLoading(true);
    try {
      await userService.updateProfile({ password: pwForm.password, new_password: pwForm.new_password });
      toast.success("Password berhasil diubah!");
      setPwForm({ password: "", new_password: "", confirm_password: "" });
      setChangingPassword(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal mengubah password.";
      toast.error(msg);
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FiUser /> Profil Saya
      </h1>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-28 relative" />
        <div className="px-6 pb-6 -mt-14">
          <div className="flex items-end justify-between mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-emerald-100 flex items-center justify-center text-4xl overflow-hidden">
                {(editing ? form.avatar_url : user?.avatar_url)
                  ? <img src={editing ? form.avatar_url : user.avatar_url} alt={user?.name} className="w-full h-full object-cover" />
                  : "🐾"
                }
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full capitalize font-medium">
                {user?.role}
              </div>
            </div>
            <button
              onClick={() => {
                if (editing) {
                  handleSave();
                } else {
                  setForm({
                    name: user?.name || "",
                    phone: user?.phone || "",
                    avatar_url: user?.avatar_url || "",
                    address: user?.address || "",
                    city: user?.city || "",
                    postal_code: user?.postal_code || "",
                  });
                  setEditing(true);
                }
              }}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${editing ? "bg-emerald-500 text-white" : "border-2 border-gray-200 text-gray-600 hover:border-emerald-400"}`}
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : editing ? <><FiCheck /> Simpan</> : <><FiEdit2 /> Edit Profil</>
              }
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Nama</label>
              {editing ? (
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-emerald-300 focus:outline-none text-sm font-medium" />
              ) : (
                <p className="text-gray-800 font-semibold px-4 py-3 bg-gray-50 rounded-xl">{user?.name}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                <FiMail className="text-gray-400" />
                <p className="text-gray-600 text-sm">{user?.email}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">No. HP</label>
              {editing ? (
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-emerald-300 focus:outline-none text-sm" />
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                  <FiPhone className="text-gray-400" />
                  <p className="text-gray-600 text-sm">{user?.phone || "-"}</p>
                </div>
              )}
            </div>
            {editing && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Foto Profil</label>
                <ImageUploadField
                  value={form.avatar_url}
                  onChange={url => setForm(p => ({ ...p, avatar_url: url }))}
                  shape="circle"
                  label="Pilih dari Galeri"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Alamat Pengiriman</label>
              {editing ? (
                <div className="space-y-2">
                  <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={2} placeholder="Nama jalan, nomor rumah, RT/RW..." className="w-full px-4 py-3 rounded-xl border-2 border-emerald-300 focus:outline-none text-sm resize-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Kota" className="w-full px-4 py-3 rounded-xl border-2 border-emerald-300 focus:outline-none text-sm" />
                    <input value={form.postal_code} onChange={e => setForm(p => ({ ...p, postal_code: e.target.value }))} placeholder="Kode Pos" className="w-full px-4 py-3 rounded-xl border-2 border-emerald-300 focus:outline-none text-sm" />
                  </div>
                  <p className="text-xs text-gray-400">Alamat ini akan otomatis terisi setiap kamu checkout.</p>
                </div>
              ) : (
                <div className="flex items-start gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                  <FiMapPin className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600 text-sm">
                    {user?.address
                      ? `${user.address}${user.city ? `, ${user.city}` : ""}${user.postal_code ? ` ${user.postal_code}` : ""}`
                      : "Belum diisi"}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Bergabung sejak</label>
              <p className="text-gray-600 text-sm px-4 py-3 bg-gray-50 rounded-xl">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">🔒 Keamanan Akun</p>
            <p className="text-xs text-gray-400 mt-0.5">Ubah password akun kamu di sini.</p>
          </div>
          {!changingPassword && (
            <button
              onClick={() => setChangingPassword(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium border-2 border-gray-200 text-gray-600 hover:border-emerald-400 transition-colors"
            >
              Ubah Password
            </button>
          )}
        </div>

        {changingPassword && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Password Lama</label>
              <input
                type="password"
                value={pwForm.password}
                onChange={e => setPwForm(p => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-emerald-300 focus:outline-none text-sm"
                placeholder="Masukkan password lama"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Password Baru</label>
              <input
                type="password"
                value={pwForm.new_password}
                onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-emerald-300 focus:outline-none text-sm"
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={pwForm.confirm_password}
                onChange={e => setPwForm(p => ({ ...p, confirm_password: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-emerald-300 focus:outline-none text-sm"
                placeholder="Ulangi password baru"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleChangePassword}
                disabled={pwLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-60"
              >
                {pwLoading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><FiCheck /> Simpan Password</>
                }
              </button>
              <button
                onClick={() => { setChangingPassword(false); setPwForm({ password: "", new_password: "", confirm_password: "" }); }}
                disabled={pwLoading}
                className="px-4 py-2 rounded-xl text-sm font-medium border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}