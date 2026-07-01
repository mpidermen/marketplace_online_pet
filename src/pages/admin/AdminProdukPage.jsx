import { useState, useEffect } from "react";
import { adminService, petService, productService } from "../../services/api";
import { formatRupiah, LoadingSpinner } from "../../components/common/UIComponents";
import { FiSearch, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminProdukPage() {
  const [tab, setTab] = useState("hewan");
  const [pets, setPets] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [petsRes, productsRes] = await Promise.all([
        adminService.getAllPets({ limit: 100 }),
        adminService.getAllProducts({ limit: 100 }),
      ]);
      setPets(petsRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err) {
      toast.error("Gagal memuat data produk/hewan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredPets = pets.filter(p => p.pet_name.toLowerCase().includes(search.toLowerCase()));
  const filteredProducts = products.filter(p => p.product_name.toLowerCase().includes(search.toLowerCase()));

  const deletePet = async (id) => {
    if (!confirm("Hapus hewan ini?")) return;
    try {
      await petService.delete(id);
      toast.success("Hewan dihapus!");
      fetchData();
    } catch (err) {
      toast.error("Gagal menghapus hewan.");
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await productService.delete(id);
      toast.success("Produk dihapus!");
      fetchData();
    } catch (err) {
      toast.error("Gagal menghapus produk.");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Produk</h1>
        <p className="text-gray-500 text-sm mt-1">Semua listing dari seluruh seller</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-5">
        <button onClick={() => setTab("hewan")} className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-colors ${tab === "hewan" ? "bg-emerald-500 text-white" : "bg-white border-2 border-gray-200 text-gray-500"}`}>
          🐾 Hewan ({pets.length})
        </button>
        <button onClick={() => setTab("produk")} className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-colors ${tab === "produk" ? "bg-amber-500 text-white" : "bg-white border-2 border-gray-200 text-gray-500"}`}>
          📦 Produk ({products.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Cari ${tab}...`} className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <LoadingSpinner /> : tab === "hewan" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3">Hewan</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Seller</th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell">Spesies</th>
                  <th className="text-left px-5 py-3">Harga</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">Stok</th>
                  <th className="text-right px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPets.map(pet => (
                  <tr key={pet.pet_id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={pet.image_url} alt={pet.pet_name} className="w-11 h-11 rounded-xl object-cover bg-gray-100" onError={e => e.target.src="https://via.placeholder.com/44?text=img"} />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{pet.pet_name}</p>
                          <p className="text-xs text-gray-400">{pet.breed} · {pet.age_month}bln</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-sm text-gray-500">{pet.seller_name}</td>
                    <td className="px-5 py-4 hidden sm:table-cell"><span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">{pet.species}</span></td>
                    <td className="px-5 py-4 text-sm font-bold text-emerald-600">{formatRupiah(pet.price)}</td>
                    <td className="px-5 py-4 hidden lg:table-cell text-sm text-gray-500">{pet.stock}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => deletePet(pet.pet_id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPets.length === 0 && <div className="text-center py-12 text-gray-400"><p className="text-3xl mb-2">🐾</p><p className="text-sm">Tidak ada hewan.</p></div>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3">Produk</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Seller</th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell">Kategori</th>
                  <th className="text-left px-5 py-3">Harga</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">Stok</th>
                  <th className="text-right px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map(prod => (
                  <tr key={prod.product_id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={prod.image_url} alt={prod.product_name} className="w-11 h-11 rounded-xl object-cover bg-gray-100" onError={e => e.target.src="https://via.placeholder.com/44?text=img"} />
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 max-w-48">{prod.product_name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-sm text-gray-500">{prod.seller_name}</td>
                    <td className="px-5 py-4 hidden sm:table-cell"><span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">{prod.category_icon} {prod.category_name || "-"}</span></td>
                    <td className="px-5 py-4 text-sm font-bold text-emerald-600">{formatRupiah(prod.price)}</td>
                    <td className="px-5 py-4 hidden lg:table-cell text-sm text-gray-500">{prod.stock}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => deleteProduct(prod.product_id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && <div className="text-center py-12 text-gray-400"><p className="text-3xl mb-2">📦</p><p className="text-sm">Tidak ada produk.</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}
