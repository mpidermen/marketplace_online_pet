import { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { formatRupiah, LoadingSpinner } from "../../components/common/UIComponents";
import { FiTrendingUp, FiDollarSign, FiPackage, FiClock } from "react-icons/fi";

const STATUS_LABEL = {
  pending:    "Pending",
  processing: "Diproses",
  shipped:    "Dikirim",
  delivered:  "Selesai",
  cancelled:  "Dibatalkan",
};

export default function AdminEarningsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getEarnings()
      .then(res => setData(res.data))
      .catch(err => {
        console.error("Admin earnings error:", err?.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data)   return <p className="text-center text-gray-500 mt-10">Gagal memuat data.</p>;

  const potensiFee = data.total_fee_on_going;
  const cairFee    = data.total_fee_delivered;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Keuntungan Platform</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fee platform {data.fee_percent}% dari setiap transaksi + ongkos kirim Rp{(data.shipping_cost||0).toLocaleString("id-ID")}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Fee Sudah Cair",       value: formatRupiah(cairFee),    icon: FiDollarSign,  bg: "bg-emerald-50", text: "text-emerald-600", sub: `${data.total_orders_delivered} pesanan selesai` },
          { label: "Fee Dalam Proses",      value: formatRupiah(potensiFee), icon: FiClock,        bg: "bg-amber-50",   text: "text-amber-600",   sub: "Potensi, belum cair" },
          { label: "Total Fee (semua)",     value: formatRupiah(cairFee + potensiFee), icon: FiTrendingUp, bg: "bg-blue-50", text: "text-blue-600", sub: "Cair + dalam proses" },
          { label: "Persentase Fee",        value: `${data.fee_percent}%`,   icon: FiPackage,      bg: "bg-purple-50",  text: "text-purple-600",  sub: "Dari subtotal produk" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-3`}>
              <c.icon className={c.text} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{c.value}</p>
            <p className="text-xs font-semibold text-gray-600 mt-1">{c.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Fee per Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">Fee per Status Pesanan</h3>
          <div className="space-y-3">
            {Object.entries(data.by_status).map(([status, info]) => (
              <div key={status} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-700">{STATUS_LABEL[status] || status}</p>
                  <p className="text-xs text-gray-400">{info.order_count} pesanan · Omzet {formatRupiah(info.gross_subtotal)}</p>
                </div>
                <span className={`text-sm font-bold ${status === "delivered" ? "text-emerald-600" : status === "cancelled" ? "text-gray-400" : "text-amber-600"}`}>
                  {formatRupiah(info.platform_fee)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Grafik Bulanan */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">Tren Fee Bulanan (Pesanan Selesai)</h3>
          {data.monthly.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-sm">Belum ada data bulanan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(() => {
                const maxFee = Math.max(...data.monthly.map(m => m.platform_fee), 1);
                return data.monthly.map(m => (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-16 shrink-0">{m.month}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all"
                        style={{ width: `${Math.max(2, (m.platform_fee / maxFee) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-24 text-right shrink-0">
                      {formatRupiah(m.platform_fee)}
                    </span>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
