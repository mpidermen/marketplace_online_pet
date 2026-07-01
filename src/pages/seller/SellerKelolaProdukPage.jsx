import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productService } from "../../services/api";
import { formatRupiah, EmptyState, LoadingSpinner } from "../../components/common/UIComponents";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";

export default function SellerKelolaProdukPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getMyProducts();
      setProducts(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      toast.error("Gagal memuat produk.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter(p => p.product_name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus produk ini?")) return;
    try {
      await productService.delete(id);
      toast.success("Produk berhasil dihapus!");
      fetchProducts();
    } catch (err) {
      toast.error("Gagal menghapus produk.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kelola Produk</h1>
          <p className="text-gray-500 text-sm mt-1">{total} produk terdaftar</p>
        </div>
        <Link to="/seller/produk/tambah" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
          <FiPlus /> Tambah Produk
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-50">
          <div className="relative">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama produk..." className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" />
          </div>
        </div>

        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <EmptyState icon="📦" title="Belum ada produk" desc="Tambahkan produk pertama." action={<Link to="/seller/produk/tambah" className="bg-emerald-500 text-white px-6 py-2 rounded-full text-sm">Tambah Produk</Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left px-5 py-3">Produk</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Kategori</th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell">Harga</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">Stok</th>
                  <th className="text-right px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(product => (
                  <tr key={product.product_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image_url} alt={product.product_name} className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0" onError={e => e.target.src="https://via.placeholder.com/48?text=img"} />
                        <div>
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.product_name}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
                        {product.category_icon} {product.category_name || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell text-sm font-semibold text-emerald-600">{formatRupiah(product.price)}</td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${product.stock === 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
                        {product.stock === 0 ? "Habis" : `${product.stock} pcs`}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/seller/produk/edit/${product.product_id}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><FiEdit2 /></Link>
                        <button onClick={() => handleDelete(product.product_id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
