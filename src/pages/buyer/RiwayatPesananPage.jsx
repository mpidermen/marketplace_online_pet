import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderService, reviewService } from "../../services/api";
import { formatRupiah, StatusBadge, EmptyState, LoadingSpinner } from "../../components/common/UIComponents";
import { FiPackage, FiStar, FiX, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";

const STATUS_TABS = ["Semua", "pending", "processing", "shipped", "delivered", "cancelled"];
const STATUS_LABELS = { pending: "Menunggu", processing: "Diproses", shipped: "Dikirim", delivered: "Selesai", cancelled: "Dibatalkan" };

// Key unik per item PER ORDER — item sama di order berbeda tidak saling blokir
const itemKey = (order_id, item) =>
  item.item_type === "pet"
    ? `order:${order_id}:pet:${item.pet_id}`
    : `order:${order_id}:product:${item.product_id}`;

export default function RiwayatPesananPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Semua");

  // Set key item yang sudah diulas
  const [reviewedSet, setReviewedSet] = useState(new Set());

  // State modal ulasan
  const [reviewModal, setReviewModal] = useState(null); // { order_id, item }
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = {};
        if (activeTab !== "Semua") params.status = activeTab;
        const res = await orderService.getMyOrders(params);
        setOrders(res.data || []);
      } catch (err) {
        console.error("Gagal fetch orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [activeTab]);

  // Fetch item yang sudah diulas (sekali saat mount)
  useEffect(() => {
    reviewService.getMine()
      .then(res => setReviewedSet(new Set(res.data || [])))
      .catch(() => {});
  }, []);

  const openReviewModal = (order_id, item) => {
    setReviewModal({ order_id, item });
    setRating(0);
    setHoverRating(0);
    setComment("");
  };

  const closeReviewModal = () => setReviewModal(null);

  const submitReview = async () => {
    if (rating === 0) { toast.error("Pilih rating terlebih dahulu."); return; }
    setSubmitting(true);
    try {
      const { order_id, item } = reviewModal;
      await reviewService.create({
        item_type: item.item_type,
        pet_id: item.item_type === "pet" ? item.pet_id : undefined,
        product_id: item.item_type === "product" ? item.product_id : undefined,
        order_id,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Ulasan berhasil dikirim!");
      // Tandai item ini (dalam order ini) sudah diulas
      setReviewedSet(prev => new Set([...prev, itemKey(order_id, item)]));
      closeReviewModal();
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal mengirim ulasan.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FiPackage /> Riwayat Pesanan
      </h1>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab ? "bg-emerald-500 text-white" : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"}`}
          >
            {tab === "Semua" ? "Semua" : STATUS_LABELS[tab]}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Belum ada pesanan"
          desc={activeTab !== "Semua" ? `Tidak ada pesanan "${STATUS_LABELS[activeTab]}".` : "Yuk mulai belanja!"}
          action={<Link to="/katalog-hewan" className="bg-emerald-500 text-white px-8 py-3 rounded-full font-medium text-sm">Mulai Belanja</Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.order_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div>
                  <p className="text-xs text-gray-400">Order #{order.order_id.slice(0, 8)}...</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="px-5 py-4 space-y-3">
                {(order.items || []).filter(Boolean).map((item, i) => {
                  const alreadyReviewed = reviewedSet.has(itemKey(order.order_id, item));
                  return (
                    <div key={i} className="flex gap-4 items-center">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                        onError={e => e.target.src = "https://via.placeholder.com/64?text=img"}
                      />
                      <div className="flex-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.item_type === "pet" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                          {item.item_type === "pet" ? "🐾 Hewan" : "📦 Produk"}
                        </span>
                        <p className="text-sm font-semibold text-gray-800 mt-1">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity}x · {formatRupiah(item.unit_price)}</p>
                      </div>

                      {order.status === "delivered" && (
                        alreadyReviewed ? (
                          <span className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-gray-400 px-3 py-1.5">
                            <FiCheckCircle className="text-emerald-400" /> Diulas
                          </span>
                        ) : (
                          <button
                            onClick={() => openReviewModal(order.order_id, item)}
                            className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-emerald-600 border border-emerald-300 hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-colors"
                          >
                            <FiStar className="text-xs" /> Ulasan
                          </button>
                        )
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="px-5 py-4 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total Pembayaran</p>
                  <p className="text-lg font-bold text-emerald-600">{formatRupiah(order.total_price)}</p>
                </div>
                {order.status === "pending" && (
                  <button className="bg-amber-400 hover:bg-amber-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors">
                    Bayar Sekarang
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Ulasan */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Beri Ulasan</h2>
              <button onClick={closeReviewModal} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
              <img
                src={reviewModal.item.image_url}
                alt={reviewModal.item.name}
                className="w-12 h-12 rounded-lg object-cover bg-gray-200 flex-shrink-0"
                onError={e => e.target.src = "https://via.placeholder.com/48?text=img"}
              />
              <div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${reviewModal.item.item_type === "pet" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                  {reviewModal.item.item_type === "pet" ? "🐾 Hewan" : "📦 Produk"}
                </span>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{reviewModal.item.name}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Rating</p>
              <div className="flex gap-1 items-center">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-3xl transition-transform hover:scale-110"
                  >
                    <FiStar
                      className={`transition-colors ${star <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    {["", "Buruk", "Kurang", "Cukup", "Bagus", "Sangat Bagus"][rating]}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-2">Komentar <span className="text-gray-400 font-normal">(opsional)</span></p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Ceritakan pengalamanmu..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeReviewModal}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={submitReview}
                disabled={submitting || rating === 0}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
              >
                {submitting ? "Mengirim..." : "Kirim Ulasan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}