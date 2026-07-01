import { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { formatRupiah, StatusBadge, LoadingSpinner } from "../../components/common/UIComponents";
import { Link } from "react-router-dom";
import { FiUsers, FiPackage, FiShoppingBag, FiTrendingUp, FiArrowRight } from "react-icons/fi";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminService.getStats();
        setData(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-center py-20 text-gray-400">Gagal memuat data dashboard.</div>;

  const stats = [
    { label: "Total User", value: data.users.total, sub: `${data.users.buyers} buyer, ${data.users.sellers} seller`, icon: FiUsers, bg: "bg-blue-50", text: "text-blue-600", link: "/admin/users" },
    { label: "Total Hewan", value: data.pets.total, sub: `${data.pets.available} tersedia`, icon: FiPackage, bg: "bg-emerald-50", text: "text-emerald-600", link: "/admin/produk" },
    { label: "Total Produk", value: data.products.total, sub: `${data.products.available} tersedia`, icon: FiShoppingBag, bg: "bg-amber-50", text: "text-amber-600", link: "/admin/produk" },
    { label: "Total Pesanan", value: data.orders.total, sub: formatRupiah(data.revenue.total) + " revenue", icon: FiTrendingUp, bg: "bg-purple-50", text: "text-purple-600", link: "/admin/orders" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan data platform Petopia</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <Link key={s.label} to={s.link} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={s.text} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{s.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-800">Pesanan Terbaru</h3>
            <Link to="/admin/orders" className="text-sm text-emerald-600 flex items-center gap-1">Lihat semua <FiArrowRight /></Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(data.recent_orders || []).map(order => (
              <div key={order.order_id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{order.buyer_name}</p>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString("id-ID")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <p className="text-sm font-bold text-emerald-600 hidden sm:block">{formatRupiah(order.total_price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-5">Ringkasan Revenue</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="font-bold text-gray-800">{formatRupiah(data.revenue.total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revenue Terbayar</span>
              <span className="font-bold text-emerald-600">{formatRupiah(data.revenue.paid)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pesanan Selesai</span>
              <span className="font-bold text-gray-800">{data.orders.delivered || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pesanan Pending</span>
              <span className="font-bold text-yellow-500">{data.orders.pending || 0}</span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-emerald-50 rounded-xl">
            <p className="text-xs text-emerald-600 font-semibold">Total Seller Aktif</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{data.users.sellers}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
