import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { petService } from "../../services/api";
import { ImageUploadField } from "../../components/common/UIComponents";
import { FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";

// Didefinisikan di luar komponen halaman -- kalau didefinisikan di dalam,
// React akan menganggapnya komponen baru setiap kali render (tiap ketikan),
// sehingga input di dalamnya kehilangan fokus setelah 1 huruf diketik.
const Field = ({ label, children }) => (
  <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>{children}</div>
);

export default function SellerFormPetPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  const [form, setForm] = useState({
    pet_name: "", species: "Kucing", breed: "", age_month: "",
    gender: "Jantan", price: "", stock: "", image_url: "", description: "",
  });

  useEffect(() => {
    if (!isEdit) return;
    const fetchPet = async () => {
      try {
        const res = await petService.getById(id);
        const p = res.data;
        setForm({
          pet_name: p.pet_name, species: p.species, breed: p.breed || "",
          age_month: p.age_month, gender: p.gender, price: p.price,
          stock: p.stock, image_url: p.image_url || "", description: p.description || "",
        });
      } catch (err) {
        toast.error("Gagal memuat data hewan.");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchPet();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await petService.update(id, form);
        toast.success("Hewan berhasil diperbarui!");
      } else {
        await petService.create(form);
        toast.success("Hewan berhasil ditambahkan!");
      }
      navigate("/seller/hewan");
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menyimpan hewan.";
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
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"><FiArrowLeft /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{isEdit ? "Edit Hewan" : "Tambah Hewan"}</h1>
          <p className="text-gray-500 text-sm">Lengkapi informasi hewan peliharaan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <Field label="Foto Hewan">
          <ImageUploadField
            value={form.image_url}
            onChange={url => setForm(p => ({ ...p, image_url: url }))}
            label="Pilih dari Galeri"
          />
        </Field>

        <Field label="Nama Hewan">
          <input value={form.pet_name} onChange={e => setForm(p => ({ ...p, pet_name: e.target.value }))} required placeholder="Contoh: Kucing Persia Putih" className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Spesies">
            <select value={form.species} onChange={e => setForm(p => ({ ...p, species: e.target.value }))} className={inputCls + " bg-white"}>
              {["Kucing","Anjing","Burung","Ikan","Hamster","Kelinci","Reptil","Lainnya"].map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Ras / Breed">
            <input value={form.breed} onChange={e => setForm(p => ({ ...p, breed: e.target.value }))} placeholder="Contoh: Persia" className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Umur (bulan)">
            <input type="number" min="0" value={form.age_month} onChange={e => setForm(p => ({ ...p, age_month: e.target.value }))} required placeholder="3" className={inputCls} />
          </Field>
          <Field label="Jenis Kelamin">
            <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className={inputCls + " bg-white"}>
              <option value="Jantan">Jantan</option>
              <option value="Betina">Betina</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Harga (Rp)">
            <input type="number" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required placeholder="1500000" className={inputCls} />
          </Field>
          <Field label="Stok">
            <input type="number" min="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} required placeholder="1" className={inputCls} />
          </Field>
        </div>

        <Field label="Deskripsi">
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Jelaskan kondisi hewan, vaksinasi, kebiasaan makan, dll..." className={inputCls + " resize-none"} />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 transition-colors">Batal</button>
          <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
            {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</> : (isEdit ? "Perbarui Hewan" : "Tambah Hewan")}
          </button>
        </div>
      </form>
    </div>
  );
}
