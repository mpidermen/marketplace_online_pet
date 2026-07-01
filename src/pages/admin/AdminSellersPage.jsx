import { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { LoadingSpinner } from "../../components/common/UIComponents";
import { FiSearch, FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [petCounts, setPetCounts] = useState({});
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sellersRes, petsRes, productsRes] = await Promise.all([
        adminService.getUsers({ role: "seller", limit: 100 }),
        adminService.getAllPets({ limit: 100 }),
        adminService.getAllProducts({ limit: 100 }),
      ]);
      setSellers(sellersRes.data || []);

      const pCounts = {};
      (petsRes.data || []).forEach(p => { pCounts[p.seller_id] = (pCounts[p.seller_id] || 0) + 1; });
      setPetCounts(pCounts);

      const prCounts = {};
      (productsRes.data || []).forEach(p => { prCounts[p.seller_id] = (prCounts[p.seller_id] || 0) + 1; });
      setProductCounts(prCounts);
    } catch (err) {
      toast.error("Gagal memuat data seller.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = sellers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  const getPetCount = (sellerId) => petCounts[sellerId] || 0;
  const getProductCount = (sellerId) => productCounts[sellerId] || 0;

  const handleApprove = async (id) => {
    try {
      await adminService.updateUser(id, { is_active: true });
      toast.success("Seller berhasil diverifikasi!");
      fetchData();
    } catch (err) {
      toast.error("Gagal memverifikasi seller.");
    }
  };
  const handleRevoke = async (id) => {
    try {
      await adminService.updateUser(id, { is_active: false });
      toast.success("Verifikasi seller dicabut.");
      fetchData();
    } catch (err) {
      toast.error("Gagal mencabut verifikasi.");
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus seller ini?")) return;
    try {
      await adminService.deleteUser(id);
      toast.success("Seller dinonaktifkan!");
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menghapus seller.";
      toast.error(msg);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Seller</h1>
        <p className="text-gray-500 text-sm mt-1">{sellers.length} seller terdaftar</p>
      </div>

      <div className="relative mb-6 max-w-md">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau email seller..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" />
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-4">
          {filtered.map(seller => (
            <div key={seller.user_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <img src={seller.avatar_url} alt={seller.name} className="w-14 h-14 rounded-2xl" onError={e => e.target.src="https://via.placeholder.com/56?text=img"} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800">{seller.name}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${seller.is_active ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                        {seller.is_active ? "✓ Terverifikasi" : "✗ Belum Verifikasi"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">{seller.email}</p>
                    <p className="text-xs text-gray-400">{seller.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:text-right">
                  <div>
                    <p className="text-xl font-bold text-gray-800">{getPetCount(seller.user_id)}</p>
                    <p className="text-xs text-gray-400">Hewan</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-800">{getProductCount(seller.user_id)}</p>
                    <p className="text-xs text-gray-400">Produk</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {seller.is_active ? (
                      <button onClick={() => handleRevoke(seller.user_id)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                        <FiX /> Cabut
                      </button>
                    ) : (
                      <button onClick={() => handleApprove(seller.user_id)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                        <FiCheck /> Verifikasi
                      </button>
                    )}
                    <button onClick={() => handleDelete(seller.user_id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              <p className="text-3xl mb-2">🏪</p>
              <p className="text-sm">Tidak ada seller yang cocok.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
