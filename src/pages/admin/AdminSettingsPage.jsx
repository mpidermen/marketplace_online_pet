import { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { LoadingSpinner, formatRupiah } from "../../components/common/UIComponents";
import { FiSettings, FiSave, FiPercent, FiTruck, FiInfo } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [feePct, setFeePct]         = useState("");
  const [shippingCost, setShipping] = useState("");

  useEffect(() => {
    adminService.getSettings()
      .then(res => {
        const s = res.data;
        setSettings(s);
        setFeePct(s.platform_fee_percent ?? 10);
        setShipping(s.shipping_cost ?? 15000);
      })
      .catch(() => toast.error("Gagal memuat pengaturan."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const fee  = parseFloat(feePct);
    const ship = parseFloat(shippingCost);
    if (isNaN(fee)  || fee < 0  || fee > 100) { toast.error("Fee harus 0–100%."); return; }
    if (isNaN(ship) || ship < 0)              { toast.error("Ongkir tidak boleh negatif."); return; }

    setSaving(true);
    try {
      const res = await adminService.updateSettings({ platform_fee_percent: fee, shipping_cost: ship });
      setSettings(res.data);
      toast.success("Pengaturan berhasil disimpan!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  // Simulasi perhitungan dari contoh transaksi
  const exampleSubtotal = 500000;
  const simFee     = Math.round(exampleSubtotal * (parseFloat(feePct) || 0) / 100);
  const simPayout  = exampleSubtotal - simFee;
  const simTotal   = exampleSubtotal + (parseFloat(shippingCost) || 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        <FiSettings /> Pengaturan Platform
      </h1>
      <p className="text-gray-500 text-sm mb-8">Atur fee admin dan ongkos kirim yang berlaku untuk semua transaksi baru.</p>

      <div className="space-y-5">
        {/* Fee Admin */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-1">
            <FiPercent className="text-emerald-500" />
            <h2 className="text-base font-semibold text-gray-800">Fee Platform (Admin)</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">Persentase yang dipotong dari subtotal penjualan seller.</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0" max="100" step="0.5"
              value={feePct}
              onChange={e => setFeePct(e.target.value)}
              className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-center font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <span className="text-gray-500 text-sm font-medium">%</span>
          </div>
        </div>

        {/* Ongkir */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-1">
            <FiTruck className="text-blue-500" />
            <h2 className="text-base font-semibold text-gray-800">Ongkos Kirim (Flat)</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">Biaya pengiriman flat yang ditambahkan ke total bayar pembeli.</p>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm">Rp</span>
            <input
              type="number"
              min="0" step="1000"
              value={shippingCost}
              onChange={e => setShipping(e.target.value)}
              className="w-44 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>

        {/* Simulasi */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <FiInfo className="text-amber-500" />
            <h2 className="text-sm font-semibold text-amber-700">Simulasi transaksi Rp 500.000</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal produk</span>
              <span>{formatRupiah(exampleSubtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Ongkos kirim</span>
              <span>+ {formatRupiah(parseFloat(shippingCost) || 0)}</span>
            </div>
            <div className="border-t border-amber-200 pt-2 flex justify-between font-semibold text-gray-800">
              <span>Total dibayar pembeli</span>
              <span>{formatRupiah(simTotal)}</span>
            </div>
            <div className="border-t border-amber-200 pt-2 flex justify-between text-red-500">
              <span>Fee platform ({feePct || 0}%)</span>
              <span>- {formatRupiah(simFee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-emerald-600">
              <span>Pendapatan seller</span>
              <span>{formatRupiah(simPayout)}</span>
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-2xl text-sm transition-colors"
        >
          <FiSave />
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>

        <p className="text-center text-xs text-gray-400">
          Perubahan hanya berlaku untuk pesanan baru. Pesanan yang sudah ada tidak terpengaruh.
        </p>
      </div>
    </div>
  );
}
