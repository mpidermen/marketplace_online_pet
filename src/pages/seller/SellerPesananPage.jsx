import { useState, useEffect } from "react";
import { orderService } from "../../services/api";
import { formatRupiah, StatusBadge, LoadingSpinner } from "../../components/common/UIComponents";
import { FiMapPin, FiPhone, FiCreditCard } from "react-icons/fi";
import toast from "react-hot-toast";

const STATUS_TABS = ["Semua", "pending", "processing", "shipped", "delivered"];
const STATUS_LABELS = { pending: "Menunggu", processing: "Diproses", shipped: "Dikirim", delivered: "Selesai" };
const NEXT_STATUS = { pending: "processing", processing: "shipped", shipped: "delivered" };
const PAYMENT_LABELS = { cod: "COD (Bayar di Tempat)", transfer: "Transfer Bank", ewallet: "E-Wallet" };

export default function SellerPesananPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Semua");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== "Semua") params.status = activeTab;
      const res = await orderService.getSellerOrders(params);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Gagal memuat pesanan:", err);
      const msg = err?.response?.data?.message || err?.message || "Gagal memuat pesanan.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [activeTab]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      toast.success(`Status diperbarui ke "${STATUS_LABELS[newStatus]}"`);
      fetchOrders();
    } catch (err) {
      toast.error("Gagal memperbarui status.");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pesanan Masuk</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} pesanan</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab ? "bg-emerald-500 text-white" : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"}`}>
            {tab === "Semua" ? "Semua" : STATUS_LABELS[tab]}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">Tidak ada pesanan di kategori ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const next = NEXT_STATUS[order.status];
            return (
              <div key={order.order_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{order.buyer_name}</p>
                    <p className="text-xs text-gray-400">Order #{String(order.order_id).slice(0,8)}... · {new Date(order.created_at).toLocaleDateString("id-ID")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    {next && (
                      <button onClick={() => updateStatus(order.order_id, next)}
                        className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-full transition-colors">
                        → {STATUS_LABELS[next]}
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-5 py-4 space-y-2">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${item.item_type === "pet" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                        {item.item_type === "pet" ? "🐾" : "📦"}
                      </span>
                      <p className="text-sm text-gray-700 flex-1">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity}x</p>
                      <p className="text-sm font-semibold text-gray-700">{formatRupiah(item.unit_price)}</p>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-4 bg-emerald-50/50 border-t border-b border-gray-50 space-y-2">
                  <div className="flex items-start gap-2">
                    <FiMapPin className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      {order.shipping_address}
                      {order.shipping_city && `, ${order.shipping_city}`}
                      {order.shipping_postal && ` ${order.shipping_postal}`}
                    </p>
                  </div>
                  {order.buyer_phone && (
                    <div className="flex items-center gap-2">
                      <FiPhone className="text-emerald-500 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{order.buyer_phone}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FiCreditCard className="text-emerald-500 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{PAYMENT_LABELS[order.payment_method] || order.payment_method || "-"}</p>
                  </div>
                  {order.notes && (
                    <p className="text-xs text-gray-500 italic pl-6">Catatan: {order.notes}</p>
                  )}
                </div>

                <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                  <p className="text-xs text-gray-500">Total Pesanan</p>
                  <p className="font-bold text-emerald-600">{formatRupiah(order.total_price)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}