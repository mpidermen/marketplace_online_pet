import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productService, categoryService } from "../../services/api";
import { ImageUploadField } from "../../components/common/UIComponents";
import { FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";

// Didefinisikan di luar komponen halaman -- kalau didefinisikan di dalam,
// React akan menganggapnya komponen baru setiap kali render (tiap ketikan),
// sehingga input di dalamnya kehilangan fokus setelah 1 huruf diketik.
const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    {children}
  </div>
);

export default function SellerFormProdukPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    product_name: "",
    category_id: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
  });

  useEffect(() => {
    categoryService.getAll()
      .then(res => {
        const cats = res.data || [];
        setCategories(cats);
        setForm(p => (p.category_id ? p : { ...p, category_id: cats[0]?.category_id || "" }));
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const fetchProduct = async () => {
      try {
        const res = await productService.getById(id);
        const p = res.data;
        setForm({
          product_name: p.product_name,
          category_id: p.category_id || "",
          description: p.description || "",
          price: p.price,
          stock: p.stock,
          image_url: p.image_url || "",
        });
      } catch (err) {
        toast.error("Gagal memuat data produk.");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchProduct();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, category_id: form.category_id || null };
      if (isEdit) {
        await productService.update(id, payload);
        toast.success("Produk berhasil diperbarui!");
      } else {
        await productService.create(payload);
        toast.success("Produk berhasil ditambahkan!");
      }
      navigate("/seller/produk");
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menyimpan produk.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm transition-colors";

  if (fetchLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
          <FiArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{isEdit ? "Edit Produk" : "Tambah Produk"}</h1>
          <p className="text-gray-500 text-sm">Lengkapi informasi produk peliharaan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <Field label="Foto Produk">
          <ImageUploadField
            value={form.image_url}
            onChange={url => setForm(p => ({ ...p, image_url: url }))}
            label="Pilih dari Galeri"
          />
        </Field>

        <Field label="Nama Produk">
          <input value={form.product_name} onChange={e => setForm(p => ({ ...p, product_name: e.target.value }))} required placeholder="Contoh: Royal Canin Adult Cat Food 2kg" className={inputCls} />
        </Field>

        <Field label="Kategori">
          <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: Number(e.target.value) }))} className={inputCls + " bg-white"}>
            {categories.map(cat => (
              <option key={cat.category_id} value={cat.category_id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Deskripsi Produk">
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Jelaskan produk secara detail, manfaat, cara pakai, dll..." className={inputCls + " resize-none"} required />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Harga (Rp)">
            <input type="number" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required placeholder="150000" className={inputCls} />
          </Field>
          <Field label="Stok">
            <input type="number" min="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} required placeholder="50" className={inputCls} />
          </Field>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 transition-colors">
            Batal
          </button>
          <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
            {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</> : (isEdit ? "Perbarui Produk" : "Tambah Produk")}
          </button>
        </div>
      </form>
    </div>
  );
}
