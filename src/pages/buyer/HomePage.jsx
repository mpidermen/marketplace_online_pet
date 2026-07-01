import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { petService, productService, categoryService } from "../../services/api";
import { PetCard, ProductCard, LoadingSpinner } from "../../components/common/UIComponents";
import { FiArrowRight, FiShield, FiTruck, FiStar } from "react-icons/fi";
import { GiPawPrint } from "react-icons/gi";

const SPECIES_ICONS = {
  Kucing: "🐱", Anjing: "🐶", Burung: "🦜", Ikan: "🐟", Hamster: "🐹", Kelinci: "🐰"
};

export default function HomePage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [featuredPets, setFeaturedPets] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHome = async () => {
      setLoading(true);
      try {
        const [petsRes, productsRes, catRes] = await Promise.all([
          petService.getAll({ limit: 4, sort: "newest" }),
          productService.getAll({ limit: 4, sort: "newest" }),
          categoryService.getAll(),
        ]);
        setFeaturedPets(petsRes.data || []);
        setFeaturedProducts(productsRes.data || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error("Gagal memuat data beranda:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHome();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/katalog-hewan?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
                <GiPawPrint /> Marketplace Hewan Peliharaan #1 Indonesia
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                Temukan Sahabat<br />
                <span className="text-yellow-300">Berbulu Impianmu</span> 🐾
              </h1>
              <p className="text-emerald-100 text-lg mb-8 leading-relaxed">
                Ribuan hewan peliharaan dari seller terpercaya. Kucing, anjing, burung, ikan, dan masih banyak lagi!
              </p>
              <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cari hewan atau produk..."
                  className="flex-1 px-5 py-3 rounded-full text-gray-800 text-sm focus:outline-none shadow-lg"
                />
                <button type="submit" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-6 py-3 rounded-full transition-colors shadow-lg">
                  Cari
                </button>
              </form>
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.entries(SPECIES_ICONS).map(([sp, icon]) => (
                  <Link key={sp} to={`/katalog-hewan?species=${sp}`} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm transition-colors">
                    <span>{icon}</span> {sp}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4">
              {featuredPets.slice(0, 4).map(pet => (
                <Link key={pet.pet_id} to={`/hewan/${pet.pet_id}`} className="group relative rounded-2xl overflow-hidden aspect-square shadow-xl hover:scale-105 transition-transform duration-300">
                  <img src={pet.image_url} alt={pet.pet_name} className="w-full h-full object-cover" onError={e => e.target.src="https://via.placeholder.com/300x300?text=No+Image"} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white text-xs font-bold truncate">{pet.pet_name}</p>
                    <p className="text-emerald-300 text-xs font-semibold">Rp {(pet.price/1000).toFixed(0)}K</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: FiShield, title: "Seller Terverifikasi", desc: "Semua seller telah diverifikasi" },
              { icon: FiTruck, title: "Pengiriman Aman", desc: "Hewan dikirim dengan aman" },
              { icon: FiStar, title: "Garansi Kepuasan", desc: "Rating & ulasan transparan" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="bg-emerald-100 p-3 rounded-xl flex-shrink-0">
                  <Icon className="text-emerald-600 text-xl" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Kategori Produk</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <Link key={cat.category_id} to={`/katalog-produk?category=${cat.category_id}`} className="flex-shrink-0 flex flex-col items-center gap-2 bg-white hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 rounded-2xl px-6 py-4 transition-all group">
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-xs font-medium text-gray-600 group-hover:text-emerald-600">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Pets */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Hewan Pilihan</h2>
            <p className="text-sm text-gray-500">Hewan peliharaan pilihan minggu ini</p>
          </div>
          <Link to="/katalog-hewan" className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
            Lihat semua <FiArrowRight />
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : featuredPets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            <p className="text-3xl mb-2">🐾</p>
            <p className="text-sm">Belum ada hewan yang dijual. Yuk jadi seller pertama!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredPets.map(pet => <PetCard key={pet.pet_id} pet={{ ...pet, rating: pet.avg_rating || 0, sold: pet.review_count || 0 }} />)}
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Jadi Seller di Petopia!</h3>
            <p className="text-amber-100 text-sm">Mulai jual hewan & produk peliharaan. Gratis & mudah.</p>
          </div>
          <Link to="/register" className="bg-white text-amber-500 font-bold px-8 py-3 rounded-full hover:shadow-lg transition-shadow flex-shrink-0">
            Daftar Sekarang
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Produk Terlaris</h2>
            <p className="text-sm text-gray-500">Perlengkapan terbaik untuk hewan kesayanganmu</p>
          </div>
          <Link to="/katalog-produk" className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
            Lihat semua <FiArrowRight />
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : featuredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-sm">Belum ada produk yang dijual.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map(p => <ProductCard key={p.product_id} product={{ ...p, rating: p.avg_rating || 0, sold: p.review_count || 0 }} />)}
          </div>
        )}
      </section>
    </div>
  );
}
