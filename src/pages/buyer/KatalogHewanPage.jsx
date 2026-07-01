import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { petService } from "../../services/api";
import { PetCard, EmptyState, LoadingSpinner } from "../../components/common/UIComponents";
import { petSpecies } from "../../data/dummy";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";

export default function KatalogHewanPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [species, setSpecies] = useState(searchParams.get("species") || "Semua");
  const [gender, setGender] = useState("Semua");
  const [sortBy, setSortBy] = useState("newest");
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [showFilter, setShowFilter] = useState(false);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const params = { limit: 24, sort: sortBy };
      if (search) params.search = search;
      if (species !== "Semua") params.species = species;
      if (gender !== "Semua") params.gender = gender;
      if (maxPrice < 10000000) params.max_price = maxPrice;

      const res = await petService.getAll(params);
      setPets(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      console.error("Gagal fetch pets:", err);
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPets(); }, [species, gender, sortBy, maxPrice]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPets();
  };

  const resetFilters = () => {
    setSearch(""); setSpecies("Semua"); setGender("Semua");
    setSortBy("newest"); setMaxPrice(10000000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Katalog Hewan 🐾</h1>
        <p className="text-gray-500 text-sm mt-1">{total} hewan tersedia</p>
      </div>

      <div className="flex gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama hewan atau ras..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm"
          />
          <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
        </form>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm bg-white hidden sm:block">
          <option value="newest">Terbaru</option>
          <option value="price_asc">Harga: Rendah ke Tinggi</option>
          <option value="price_desc">Harga: Tinggi ke Rendah</option>
          <option value="rating">Rating Tertinggi</option>
        </select>
        <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-emerald-400 text-sm font-medium transition-colors">
          <FiFilter /> Filter
        </button>
      </div>

      <div className="flex gap-6">
        <aside className={`${showFilter ? "block" : "hidden"} lg:block w-full lg:w-56 flex-shrink-0`}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Filter</h3>
              <button onClick={resetFilters} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"><FiX /> Reset</button>
            </div>
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-600 mb-2">Spesies</p>
              <div className="space-y-1">
                {petSpecies.map(s => (
                  <button key={s} onClick={() => setSpecies(s)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${species === s ? "bg-emerald-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-600 mb-2">Jenis Kelamin</p>
              {["Semua", "Jantan", "Betina"].map(g => (
                <button key={g} onClick={() => setGender(g)} className={`mr-2 mb-2 px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-colors ${gender === g ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-gray-200 text-gray-500"}`}>
                  {g}
                </button>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Harga Maks: Rp {maxPrice.toLocaleString("id-ID")}</p>
              <input type="range" min="50000" max="10000000" step="50000" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-emerald-500" />
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <LoadingSpinner />
          ) : pets.length === 0 ? (
            <EmptyState icon="🔍" title="Hewan tidak ditemukan" desc="Coba ubah filter atau kata kunci pencarian." action={<button onClick={resetFilters} className="bg-emerald-500 text-white px-6 py-2 rounded-full text-sm font-medium">Reset Filter</button>} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pets.map(pet => (
                <PetCard key={pet.pet_id} pet={{ ...pet, rating: pet.avg_rating || 0, sold: pet.review_count || 0 }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
