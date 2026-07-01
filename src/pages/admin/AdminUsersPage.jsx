import { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { LoadingSpinner } from "../../components/common/UIComponents";
import { FiSearch, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua");
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { is_active: true };
      if (search) params.search = search;
      if (roleFilter !== "Semua") params.role = roleFilter;
      const res = await adminService.getUsers(params);
      setUsers(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      toast.error("Gagal memuat user.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleSearch = (e) => { e.preventDefault(); fetchUsers(); };

  const handleRoleChange = async (id, newRole) => {
    try {
      await adminService.updateUser(id, { role: newRole });
      toast.success("Role user diperbarui!");
      fetchUsers();
    } catch (err) {
      toast.error("Gagal mengubah role.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin nonaktifkan user ini?")) return;
    try {
      await adminService.deleteUser(id);
      toast.success("User berhasil dinonaktifkan!");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus user.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kelola User</h1>
          <p className="text-gray-500 text-sm mt-1">{total} user terdaftar</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau email..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" />
        </form>
        <div className="flex gap-2">
          {["Semua", "buyer", "seller", "admin"].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors ${roleFilter === r ? "bg-emerald-500 text-white" : "bg-white border-2 border-gray-200 text-gray-500 hover:border-gray-300"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3">User</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Email</th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell">No. HP</th>
                  <th className="text-left px-5 py-3">Role</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">Status</th>
                  <th className="text-right px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-lg flex-shrink-0">
                          {u.avatar_url ? <img src={u.avatar_url} alt={u.name} className="w-full h-full rounded-full object-cover" /> : "👤"}
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-sm text-gray-500">{u.email}</td>
                    <td className="px-5 py-4 hidden sm:table-cell text-sm text-gray-500">{u.phone || "-"}</td>
                    <td className="px-5 py-4">
                      <select value={u.role} onChange={e => handleRoleChange(u.user_id, e.target.value)}
                        className="text-xs font-bold px-2 py-1 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-emerald-400">
                        <option value="buyer">buyer</option>
                        <option value="seller">seller</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.is_active ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                        {u.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end">
                        <button onClick={() => handleDelete(u.user_id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-400"><p className="text-3xl mb-2">👤</p><p className="text-sm">Tidak ada user.</p></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
