import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { petService, productService, orderService } from "../../services/api";
import { formatRupiah, StatusBadge, LoadingSpinner } from "../../components/common/UIComponents";
import { Link } from "react-router-dom";
import { FiPackage, FiShoppingBag, FiTrendingUp, FiDollarSign, FiArrowRight, FiInfo } from "react-icons/fi";

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pets: 0, products: 0, orders: 0,
    grossDelivered: 0, netDelivered: 0,
    grossOnGoing: 0, netOnGoing: 0,
    feePct: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [petsRes, prodsRes, ordersRes, statsRes] = await Promise.all([
          petService.getMyPets(),
          productService.getMyProducts(),
          orderService.getSellerOrders({ limit: 5 }),
          orderService.getSellerStats(),
        ]);

        const s = statsRes.data;
        setStats({
          pets: petsRes.pagination?.total || 0,
          products: prodsRes.pagination?.total || 0,
          orders: ordersRes.pagination?.total || 0,
          grossDelivered: s.gross_delivered,
          netDelivered: s.net_delivered,
          grossOnGoing: s.gross_on_going,
          netOnGoing: s.net_on_going,
          feePct: s.fee_percent,
          totalOrders: s.total_orders,
        });
        setRecentOrders(ordersRes.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Halo, {user?.name}! 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Selamat datang di dashboard seller Petopia.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Hewan", value: stats.pets, icon: FiPackage, bg: "bg-emerald-50", text: "text-emerald-600", link: "/seller/hewan" },
          { label: "Total Produk", value: stats.products, icon: FiShoppingBag, bg: "bg-blue-50", text: "text-blue-600", link: "/seller/produk" },
          { label: "Pesanan Masuk", value: stats.orders, icon: FiTrendingUp, bg: "bg-amber-50", text: "text-amber-600", link: "/seller/pesanan" },
          { label: "Keuntungan Bersih", value: formatRupiah(stats.netDelivered), icon: FiDollarSign, bg: "bg-purple-50", text: "text-purple-600", link: "/seller/pesanan" },
        ].map(s => (
          <Link key={s.label} to={s.link} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={s.text} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Earnings Detail */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Sudah Cair */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">💰 Pendapatan Selesai</h3>
            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">Sudah cair</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Omzet kotor</span>
              <span className="font-semibold text-gray-700">{formatRupiah(stats.grossDelivered)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1">
                Biaya platform ({stats.feePct}%)
              </span>
              <span className="font-semibold text-red-500">- {formatRupiah(stats.grossDelivered - stats.netDelivered)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-bold text-gray-700">Keuntungan bersih</span>
              <span className="font-bold text-emerald-600 text-lg">{formatRupiah(stats.netDelivered)}</span>
            </div>
          </div>
        </div>

        {/* Masih Berjalan */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">⏳ Estimasi Dalam Proses</h3>
            <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full">Belum cair</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Omzet kotor</span>
              <span className="font-semibold text-gray-700">{formatRupiah(stats.grossOnGoing)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Biaya platform ({stats.feePct}%)</span>
              <span className="font-semibold text-red-500">- {formatRupiah(stats.grossOnGoing - stats.netOnGoing)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-bold text-gray-700">Estimasi bersih</span>
              <span className="font-bold text-amber-600 text-lg">{formatRupiah(stats.netOnGoing)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
            <FiInfo size={11}/> Dari pesanan pending, processing & shipped
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-800">Pesanan Terbaru</h3>
            <Link to="/seller/pesanan" className="text-sm text-emerald-600 flex items-center gap-1">Lihat semua <FiArrowRight /></Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-400"><p className="text-3xl mb-2">📭</p><p className="text-sm">Belum ada pesanan</p></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map(order => (
                <div key={order.order_id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Order #{String(order.order_id).slice(0,8)}...</p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString("id-ID")}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="text-sm font-bold text-emerald-600 hidden sm:block">{formatRupiah(order.total_price)}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aksi Cepat */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4">Aksi Cepat</h3>
            <div className="space-y-2">
              {[
                { label: "➕ Tambah Hewan", to: "/seller/hewan/tambah" },
                { label: "➕ Tambah Produk", to: "/seller/produk/tambah" },
                { label: "📦 Kelola Pesanan", to: "/seller/pesanan" },
              ].map(a => (
                <Link key={a.to} to={a.to} className="block text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2.5 rounded-xl transition-colors font-medium">
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl p-5 text-white">
            <p className="font-bold mb-1">Tip Seller</p>
            <p className="text-sm text-emerald-100">Tambahkan foto berkualitas tinggi untuk meningkatkan penjualan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
