import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { orderService, settingsService, userService } from "../../services/api";
import { formatRupiah } from "../../components/common/UIComponents";
import { FiCheck, FiMapPin, FiCreditCard, FiMinus, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { cart, cartTotal, user, clearCart, buyNowItem, updateBuyNowQty, clearBuyNow, updateUser } = useAuth();
  const navigate = useNavigate();

  // Jika ada buyNowItem, checkout hanya menampilkan item tersebut (bukan dari cart)
  const isBuyNow = Boolean(buyNowItem);
  const checkoutItems = isBuyNow ? [buyNowItem] : cart;
  const itemsTotal = isBuyNow ? (buyNowItem.price * buyNowItem.quantity) : cartTotal;

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    postal: user?.postal_code || "",
    payment: "cod",
    notes: "",
  });
  const [saveAddress, setSaveAddress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [shipping, setShipping] = useState(0);

  useEffect(() => {
    settingsService.getPublic()
      .then(res => setShipping(parseFloat(res.data?.shipping_cost ?? 15000)))
      .catch(() => setShipping(15000));
  }, []);

  const total = itemsTotal + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.address || !form.city) { toast.error("Lengkapi alamat pengiriman!"); return; }
    if (checkoutItems.length === 0) { toast.error("Tidak ada item untuk di-checkout."); return; }
    setLoading(true);
    try {
      // items diambil dari buyNowItem (checkout langsung) atau dari cart local state
      const orderItems = checkoutItems.map(item => ({
        item_type: item.type,
        pet_id: item.type === "pet" ? item.id : undefined,
        product_id: item.type === "product" ? item.id : undefined,
        quantity: item.quantity,
      }));

      await orderService.create({
        shipping_address: form.address,
        shipping_city: form.city,
        shipping_postal: form.postal,
        notes: form.notes,
        payment_method: form.payment,
        items: orderItems,
      });

      // Simpan alamat ke profil supaya otomatis terisi lagi di checkout berikutnya
      if (saveAddress) {
        const addressChanged = form.address !== (user?.address || "") ||
          form.city !== (user?.city || "") ||
          form.postal !== (user?.postal_code || "");
        if (addressChanged) {
          try {
            const res = await userService.updateProfile({
              address: form.address,
              city: form.city,
              postal_code: form.postal,
            });
            updateUser(res.data);
          } catch {
            // Gagal simpan alamat tidak menggagalkan checkout
          }
        }
      }

      if (isBuyNow) {
        clearBuyNow();
      } else {
        clearCart();
      }
      setDone(true);
      toast.success("Pesanan berhasil dibuat! 🎉");
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal membuat pesanan.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheck className="text-emerald-500 text-4xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Berhasil! 🎉</h2>
        <p className="text-gray-500 text-sm mb-2">Terima kasih sudah berbelanja di Petopia!</p>
        <p className="text-gray-400 text-xs mb-8">Pesananmu sedang diproses dan akan segera dikirim.</p>
        <div className="flex gap-3">
          <button onClick={() => navigate("/riwayat-pesanan")} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors text-sm">
            Lihat Pesanan
          </button>
          <button onClick={() => navigate("/")} className="flex-1 border-2 border-gray-200 hover:border-emerald-400 text-gray-600 font-bold py-3 rounded-xl transition-colors text-sm">
            Belanja Lagi
          </button>
        </div>
      </div>
    </div>
  );

  if (checkoutItems.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-6xl mb-4">🛒</p>
      <h2 className="text-xl font-bold text-gray-700 mb-2">Tidak ada item untuk checkout</h2>
      <p className="text-gray-400 text-sm mb-6">Keranjangmu kosong dan tidak ada item "Beli Sekarang" yang dipilih.</p>
      <button onClick={() => navigate("/katalog-hewan")} className="bg-emerald-500 text-white px-8 py-3 rounded-full font-medium text-sm">Mulai Belanja</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            {/* Shipping */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FiMapPin className="text-emerald-500" /> Alamat Pengiriman</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Nama Penerima</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">No. HP</label>
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Alamat Lengkap</label>
                  <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} required rows={3} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm resize-none" placeholder="Nama jalan, nomor rumah, RT/RW..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Kota</label>
                  <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Kode Pos</label>
                  <input value={form.postal} onChange={e => setForm(p => ({ ...p, postal: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
                <input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                <span className="text-xs text-gray-500">Simpan alamat ini untuk checkout berikutnya</span>
              </label>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FiCreditCard className="text-emerald-500" /> Metode Pembayaran</h3>
              <div className="space-y-2">
                {[
                  { value: "transfer", label: "Transfer Bank", desc: "BCA, BNI, Mandiri, BRI", disabled: true },
                  { value: "ewallet", label: "E-Wallet", desc: "GoPay, OVO, Dana, ShopeePay", disabled: true },
                  { value: "cod", label: "COD (Bayar di Tempat)", desc: "Bayar tunai saat pesanan tiba", disabled: false },
                ].map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                      opt.disabled
                        ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
                        : form.payment === opt.value
                        ? "border-emerald-500 bg-emerald-50 cursor-pointer"
                        : "border-gray-200 hover:border-gray-300 cursor-pointer"
                    }`}
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      checked={form.payment === opt.value}
                      disabled={opt.disabled}
                      onChange={e => setForm(p => ({ ...p, payment: e.target.value }))}
                      className="accent-emerald-500"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                      <p className="text-xs text-gray-400">
                        {opt.desc}{opt.disabled && " · Segera hadir"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                * Sementara ini pembayaran hanya bisa dilakukan dengan COD (Bayar di Tempat). Metode lain akan segera diaktifkan.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Catatan (opsional)</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm resize-none" placeholder="Catatan untuk penjual..." />
            </div>
          </div>

          {/* Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4">
                Ringkasan ({checkoutItems.length} item)
                {isBuyNow && <span className="ml-2 text-xs font-semibold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full align-middle">Beli Sekarang</span>}
              </h3>
              <div className="space-y-3 mb-4 max-h-56 overflow-y-auto">
                {checkoutItems.map(item => (
                  <div key={`${item.type}-${item.id}`} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50" onError={e => e.target.src="https://via.placeholder.com/48?text=img"} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                      {isBuyNow ? (
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400">{formatRupiah(item.price)}</p>
                          <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-0.5">
                            <button type="button" onClick={() => updateBuyNowQty(item.quantity - 1)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-white transition-colors text-gray-600">
                              <FiMinus className="text-[10px]" />
                            </button>
                            <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateBuyNowQty(item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="w-5 h-5 flex items-center justify-center rounded hover:bg-white transition-colors text-gray-600 disabled:opacity-40"
                            >
                              <FiPlus className="text-[10px]" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">{item.quantity}x {formatRupiah(item.price)}</p>
                      )}
                      <p className="text-xs text-gray-500 font-semibold mt-0.5">Subtotal: {formatRupiah(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatRupiah(itemsTotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Ongkir</span><span>{formatRupiah(shipping)}</span></div>
                <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2 mt-2">
                  <span>Total</span><span className="text-emerald-600">{formatRupiah(total)}</span>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full mt-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Memproses...</>
                  : "Bayar Sekarang"
                }
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}