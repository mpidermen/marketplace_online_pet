import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { settingsService } from "../../services/api";
import { formatRupiah, EmptyState } from "../../components/common/UIComponents";
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiArrowRight } from "react-icons/fi";

export default function CartPage() {
  const { cart, removeFromCart, updateCartQty, cartTotal, clearBuyNow } = useAuth();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState(15000);

  useEffect(() => {
    settingsService.getPublic()
      .then(res => setShipping(parseFloat(res.data?.shipping_cost ?? 15000)))
      .catch(() => setShipping(15000));
  }, []);

  const total = cartTotal + shipping;

  if (cart.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <EmptyState
        icon="🛒"
        title="Keranjang kosong"
        desc="Belum ada item di keranjangmu. Yuk mulai belanja!"
        action={<Link to="/katalog-hewan" className="bg-emerald-500 text-white px-8 py-3 rounded-full font-medium">Mulai Belanja</Link>}
      />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FiShoppingCart /> Keranjang Belanja
        <span className="bg-emerald-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">{cart.length}</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="flex-1 space-y-4">
          {cart.map(item => (
            <div key={`${item.type}-${item.id}`} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 shadow-sm">
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-gray-50" onError={e => e.target.src = "https://via.placeholder.com/80?text=No+Image"} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.type === "pet" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                      {item.type === "pet" ? "🐾 Hewan" : "📦 Produk"}
                    </span>
                    <h3 className="font-semibold text-gray-800 text-sm mt-1 line-clamp-2">{item.name}</h3>
                  </div>
                  <button onClick={() => removeFromCart(item.type, item.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                    <FiTrash2 />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-emerald-600 font-bold">{formatRupiah(item.price)}</p>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                    <button onClick={() => updateCartQty(item.type, item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-gray-600">
                      <FiMinus className="text-xs" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQty(item.type, item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-gray-600 disabled:opacity-40"
                    >
                      <FiPlus className="text-xs" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">Subtotal: {formatRupiah(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:w-80">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4">Ringkasan Pesanan</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.length} item)</span>
                <span>{formatRupiah(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Ongkir</span>
                <span>{formatRupiah(shipping)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-800">
                <span>Total</span>
                <span className="text-emerald-600 text-lg">{formatRupiah(total)}</span>
              </div>
            </div>
            <button
              onClick={() => { clearBuyNow(); navigate("/checkout"); }}
              className="w-full mt-5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Checkout <FiArrowRight />
            </button>
            <Link to="/katalog-hewan" className="block text-center text-sm text-gray-400 hover:text-emerald-600 mt-3 transition-colors">
              + Tambah hewan lagi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
