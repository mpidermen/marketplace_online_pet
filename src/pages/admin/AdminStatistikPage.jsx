import { useState, useEffect } from "react";
import { adminService, petService } from "../../services/api";
import { formatRupiah, LoadingSpinner } from "../../components/common/UIComponents";

const statusData = [
  { label: "Menunggu", key: "pending", color: "bg-yellow-400", text: "text-yellow-600" },
  { label: "Diproses", key: "processing", color: "bg-blue-400", text: "text-blue-600" },
  { label: "Dikirim", key: "shipped", color: "bg-purple-400", text: "text-purple-600" },
  { label: "Selesai", key: "delivered", color: "bg-emerald-400", text: "text-emerald-600" },
  { label: "Dibatalkan", key: "cancelled", color: "bg-red-400", text: "text-red-600" },
];

const speciesList = ["Kucing", "Anjing", "Burung", "Ikan", "Hamster", "Kelinci"];
const speciesColors = {
  Kucing: "bg-pink-400", Anjing: "bg-amber-400", Burung: "bg-sky-400",
  Ikan: "bg-blue-400", Hamster: "bg-orange-400", Kelinci: "bg-purple-400",
};

function BarChart({ data, maxVal }) {
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((d, i) => {
        const pct = maxVal > 0 ? Math.round((d.count / maxVal) * 100) : 0;
        return (
          <div key={i} className="flex flex-col items-center flex-1 gap-1">
            <span className="text-xs font-bold text-gray-600">{d.count}</span>
            <div className={`w-full rounded-t-lg transition-all ${d.colorClass || "bg-emerald-400"}`} style={{ height: `${Math.max(pct, 4)}%` }} />
            <span className="text-xs text-gray-400 text-center leading-tight">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminStatistikPage() {
  const [stats, setStats] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, petsRes] = await Promise.all([
          adminService.getStats(),
          petService.getAll({ limit: 100 }),
        ]);
        setStats(statsRes.data);
        setPets(petsRes.data || []);
      } catch (err) {
        console.error("Gagal memuat statistik:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !stats) return <LoadingSpinner />;

  const totalRevenue = stats.revenue?.total || 0;
  const totalOrders = stats.orders?.total || 0;
  const avgOrder = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
  const buyers = stats.users?.buyers || 0;
  const sellers = stats.users?.sellers || 0;
  const totalUsers = stats.users?.total || 0;
  const totalPets = stats.pets?.total || 0;
  const availablePets = stats.pets?.available || 0;
  const totalProducts = stats.products?.total || 0;
  const availableProducts = stats.products?.available || 0;
  const deliveredOrders = stats.orders?.delivered || 0;

  const orderByStatus = statusData.map(s => ({
    label: s.label,
    count: stats.orders?.[s.key] || 0,
    colorClass: s.color,
  }));
  const maxStatus = Math.max(...orderByStatus.map(d => d.count), 1);

  const petsBySpecies = speciesList.map(sp => ({
    label: sp,
    count: pets.filter(p => p.species === sp).length,
    colorClass: speciesColors[sp],
  }));
  const maxSpecies = Math.max(...petsBySpecies.map(d => d.count), 1);

  const summaryCards = [
    { label: "Total Revenue", value: formatRupiah(totalRevenue), icon: "💰", bg: "from-emerald-500 to-teal-400" },
    { label: "Total Pesanan", value: totalOrders, icon: "📦", bg: "from-blue-500 to-indigo-400" },
    { label: "Rata-rata Order", value: formatRupiah(avgOrder), icon: "📊", bg: "from-amber-500 to-orange-400" },
    { label: "Total User", value: totalUsers, icon: "👥", bg: "from-purple-500 to-pink-400" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Statistik Platform</h1>
        <p className="text-gray-500 text-sm mt-1">Overview performa Petopia</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.bg} rounded-2xl p-5 text-white shadow-sm`}>
            <span className="text-2xl">{card.icon}</span>
            <p className="text-xl font-bold mt-3">{card.value}</p>
            <p className="text-xs text-white/80 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Status order chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-1">Status Pesanan</h3>
          <p className="text-xs text-gray-400 mb-5">Distribusi status seluruh pesanan</p>
          <BarChart data={orderByStatus} maxVal={maxStatus} />
          <div className="flex flex-wrap gap-2 mt-4">
            {statusData.map(s => (
              <div key={s.key} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Species chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-1">Hewan per Spesies</h3>
          <p className="text-xs text-gray-400 mb-5">Jumlah listing hewan per spesies</p>
          <BarChart data={petsBySpecies} maxVal={maxSpecies} />
          <div className="flex flex-wrap gap-2 mt-4">
            {speciesList.map(sp => (
              <div key={sp} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${speciesColors[sp]}`} />
                <span className="text-xs text-gray-500">{sp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-5">Ringkasan Platform</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Buyer", value: buyers, icon: "🛒", color: "text-blue-600" },
            { label: "Total Seller", value: sellers, icon: "🏪", color: "text-emerald-600" },
            { label: "Total Hewan", value: totalPets, icon: "🐾", color: "text-amber-600" },
            { label: "Total Produk", value: totalProducts, icon: "📦", color: "text-purple-600" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-4xl mb-2">{s.icon}</p>
              <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Progress bars */}
        <div className="mt-8 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-gray-700">Pesanan Selesai</span>
              <span className="text-gray-500">{deliveredOrders}/{totalOrders}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${totalOrders ? (deliveredOrders / totalOrders) * 100 : 0}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-gray-700">Hewan Tersedia (stok &gt; 0)</span>
              <span className="text-gray-500">{availablePets}/{totalPets}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${totalPets ? (availablePets / totalPets) * 100 : 0}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-gray-700">Produk Tersedia (stok &gt; 0)</span>
              <span className="text-gray-500">{availableProducts}/{totalProducts}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${totalProducts ? (availableProducts / totalProducts) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
