import { useState, useEffect } from "react";
import { adminService, orderService } from "../../services/api";
import { formatRupiah, StatusBadge, LoadingSpinner } from "../../components/common/UIComponents";
import { FiSearch, FiChevronDown, FiChevronUp, FiMapPin, FiPhone, FiCreditCard } from "react-icons/fi";
import toast from "react-hot-toast";

const PAYMENT_LABELS = { cod: "COD (Bayar di Tempat)", transfer: "Transfer Bank", ewallet: "E-Wallet" };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [expanded, setExpanded] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "Semua") params.status = statusFilter;
      const res = await adminService.getOrders(params);
      setOrders(res.data || []);
    } catch (err) {
      toast.error("Gagal memuat pesanan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const filtered = orders.filter(o => {
    const matchSearch =
      String(o.order_id).toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_name?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const toggleExpand = async (orderId) => {
    if (expanded === orderId) { setExpanded(null); return; }
    setExpanded(orderId);
    if (!orderDetails[orderId]) {
      try {
        const res = await orderService.getById(orderId);
        setOrderDetails(prev => ({ ...prev, [orderId]: res.data }));
      } catch (err) {
        toast.error("Gagal memuat detail pesanan.");
      }
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await adminService.updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.order_id === id ? { ...o, status } : o));
      toast.success("Status pesanan diperbarui!");
    } catch (err) {
      toast.error("Gagal memperbarui status.");
    }
  };

  const statuses = ["Semua", "pending", "processing", "shipped", "delivered", "cancelled"];
  const statusLabels = { pending: "Menunggu", processing: "Diproses", shipped: "Dikirim", delivered: "Selesai", cancelled: "Dibatalkan" };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Pesanan</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} total pesanan</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari ID pesanan atau nama buyer..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-400 bg-white text-sm font-medium text-gray-600 focus:outline-none">
          {statuses.map(s => <option key={s} value={s}>{s === "Semua" ? "Semua Status" : statusLabels[s]}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {filtered.map(order => {
            const isExpanded = expanded === order.order_id;
            const detail = orderDetails[order.order_id];
            return (
              <div key={order.order_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div
                  className="flex flex-wrap items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(order.order_id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">
                      {order.buyer_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{order.buyer_name}</p>
                      <p className="text-xs text-gray-400">Order #{String(order.order_id).slice(0, 8)}... · {new Date(order.created_at).toLocaleDateString("id-ID")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-emerald-600 hidden sm:block">{formatRupiah(order.total_price)}</p>
                    <StatusBadge status={order.status} />
                    <select
                      value={order.status}
                      onChange={e => { e.stopPropagation(); updateStatus(order.order_id, e.target.value); }}
                      onClick={e => e.stopPropagation()}
                      className="text-xs border-2 border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-emerald-400 hidden sm:block"
                    >
                      {["pending", "processing", "shipped", "delivered", "cancelled"].map(s => (
                        <option key={s} value={s}>{statusLabels[s]}</option>
                      ))}
                    </select>
                    {isExpanded ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-3">
                    {!detail ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <div className="bg-white rounded-xl px-4 py-3 space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Info Pengiriman</p>
                          <div className="flex items-start gap-2">
                            <FiMapPin className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">
                              {detail.shipping_address}
                              {detail.shipping_city && `, ${detail.shipping_city}`}
                              {detail.shipping_postal && ` ${detail.shipping_postal}`}
                            </p>
                          </div>
                          {detail.buyer_phone && (
                            <div className="flex items-center gap-2">
                              <FiPhone className="text-emerald-500 flex-shrink-0" />
                              <p className="text-sm text-gray-700">{detail.buyer_phone}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <FiCreditCard className="text-emerald-500 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{PAYMENT_LABELS[detail.payment_method] || detail.payment_method || "-"}</p>
                          </div>
                          {detail.notes && (
                            <p className="text-xs text-gray-500 italic pl-6">Catatan: {detail.notes}</p>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Item Pesanan</p>
                        {(detail.items || []).filter(Boolean).map((item, i) => (
                          <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${item.item_type === "pet" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                              {item.item_type === "pet" ? "🐾" : "📦"}
                            </span>
                            <p className="text-sm text-gray-700 flex-1">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.quantity}x</p>
                            <p className="text-sm font-semibold text-gray-800">{formatRupiah(item.subtotal)}</p>
                          </div>
                        ))}
                      </>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-bold text-emerald-600">{formatRupiah(order.total_price)}</p>
                    </div>
                    {/* Mobile status change */}
                    <div className="sm:hidden">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Ubah Status:</label>
                      <select value={order.status} onChange={e => updateStatus(order.order_id, e.target.value)} className="w-full text-sm border-2 border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-emerald-400">
                        {["pending", "processing", "shipped", "delivered", "cancelled"].map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm">Tidak ada pesanan yang cocok.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}