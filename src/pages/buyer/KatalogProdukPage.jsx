import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { productService, categoryService } from "../../services/api";
import { ProductCard, EmptyState, LoadingSpinner } from "../../components/common/UIComponents";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";

export default function KatalogProdukPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") ? Number(searchParams.get("category")) : 0);
  const [sortBy, setSortBy] = useState("newest");
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [showFilter, setShowFilter] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { limit: 24, sort: sortBy };
      if (search) params.search = search;
      if (category) params.category_id = category;
      if (maxPrice < 1000000) params.max_price = maxPrice;

      const res = await productService.getAll(params);
      setProducts(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      console.error("Gagal fetch products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [category, sortBy, maxPrice]);

  useEffect(() => {
    categoryService.getAll().then(res => setCategories(res.data || [])).catch(() => setCategories([]));
  }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchProducts(); };
  const resetFilters = () => { setSearch(""); setCategory(0); setSortBy("newest"); setMaxPrice(1000000); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Katalog Produk 🛍️</h1>
        <p className="text-gray-500 text-sm mt-1">{total} produk tersedia</p>
      </div>

      <div className="flex gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..." className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" />
          <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
        </form>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 text-sm bg-white hidden sm:block">
          <option value="newest">Terbaru</option>
          <option value="price_asc">Termurah</option>
          <option value="price_desc">Termahal</option>
          <option value="rating">Rating Terbaik</option>
        </select>
        <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-emerald-400 text-sm font-medium transition-colors">
          <FiFilter /> Filter
        </button>
      </div>

      <div className="flex gap-6">
        <aside className={`${showFilter ? "block" : "hidden"} lg:block w-56 flex-shrink-0`}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Kategori</h3>
              <button onClick={resetFilters} className="text-xs text-red-400 flex items-center gap-1"><FiX /> Reset</button>
            </div>
            <button onClick={() => setCategory(0)} className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${category === 0 ? "bg-emerald-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>Semua Kategori</button>
            {categories.map(cat => (
              <button key={cat.category_id} onClick={() => setCategory(cat.category_id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors flex items-center gap-2 ${category === cat.category_id ? "bg-emerald-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-600 mb-2">Harga Maks: Rp {maxPrice.toLocaleString("id-ID")}</p>
              <input type="range" min="10000" max="1000000" step="10000" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-emerald-500" />
            </div>
          </div>
        </aside>
        <div className="flex-1">
          {loading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <EmptyState icon="🔍" title="Produk tidak ditemukan" desc="Coba ubah filter atau kata kunci." action={<button onClick={resetFilters} className="bg-emerald-500 text-white px-6 py-2 rounded-full text-sm">Reset</button>} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(p => (
                <ProductCard key={p.product_id} product={{ ...p, rating: p.avg_rating || 0, sold: p.review_count || 0 }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
