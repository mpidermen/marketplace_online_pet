import { FiStar, FiShoppingCart, FiEye, FiZap, FiCamera, FiImage } from "react-icons/fi";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { uploadService } from "../../services/api";
import toast from "react-hot-toast";

// ==================== PET CARD ====================
export function PetCard({ pet }) {
  const { addToCart, buyNow, user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) { toast.error("Login dulu untuk beli!"); return; }
    addToCart({ type: "pet", id: pet.pet_id, name: pet.pet_name, price: pet.price, image: pet.image_url, stock: pet.stock });
    toast.success(`${pet.pet_name} ditambahkan ke keranjang!`);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    if (!user) { toast.error("Login dulu untuk beli!"); return; }
    buyNow({ type: "pet", id: pet.pet_id, name: pet.pet_name, price: pet.price, image: pet.image_url, stock: pet.stock });
    navigate("/checkout");
  };

  return (
    <Link to={`/hewan/${pet.pet_id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:-translate-y-1 flex flex-col">
      <div className="relative overflow-hidden aspect-square bg-gray-50">
        <img src={pet.image_url} alt={pet.pet_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => e.target.src = "https://via.placeholder.com/300x300?text=No+Image"} />
        <div className="absolute top-2 left-2">
          <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">{pet.species}</span>
        </div>
        {pet.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">Habis</span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-0.5">{pet.breed}</p>
        <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 flex-1">{pet.pet_name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <FiStar className="text-yellow-400 fill-yellow-400 text-xs" />
          <span className="text-xs text-gray-500">{pet.rating} · {pet.sold} terjual</span>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
          <p className="font-bold text-emerald-600 text-sm">{formatRupiah(pet.price)}</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleBuyNow}
              disabled={pet.stock === 0}
              title="Beli Sekarang"
              className="p-1.5 bg-amber-50 hover:bg-amber-500 text-amber-500 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiZap className="text-sm" />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={pet.stock === 0}
              title="Tambah ke Keranjang"
              className="p-1.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingCart className="text-sm" />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">Umur: {pet.age_month} bulan · {pet.gender}</p>
      </div>
    </Link>
  );
}

// ==================== PRODUCT CARD ====================
export function ProductCard({ product }) {
  const { addToCart, buyNow, user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) { toast.error("Login dulu untuk beli!"); return; }
    addToCart({ type: "product", id: product.product_id, name: product.product_name, price: product.price, image: product.image_url, stock: product.stock });
    toast.success(`${product.product_name} ditambahkan!`);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    if (!user) { toast.error("Login dulu untuk beli!"); return; }
    buyNow({ type: "product", id: product.product_id, name: product.product_name, price: product.price, image: product.image_url, stock: product.stock });
    navigate("/checkout");
  };

  return (
    <Link to={`/produk/${product.product_id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:-translate-y-1 flex flex-col">
      <div className="relative overflow-hidden aspect-square bg-gray-50">
        <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => e.target.src = "https://via.placeholder.com/300x300?text=No+Image"} />
        <div className="absolute top-2 left-2">
          <span className="bg-amber-400 text-white text-xs px-2 py-1 rounded-full font-medium">{product.category_name || product.category}</span>
        </div>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 flex-1">{product.product_name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <FiStar className="text-yellow-400 fill-yellow-400 text-xs" />
          <span className="text-xs text-gray-500">{product.rating} · {product.sold} terjual</span>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
          <p className="font-bold text-emerald-600 text-sm">{formatRupiah(product.price)}</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              title="Beli Sekarang"
              className="p-1.5 bg-amber-50 hover:bg-amber-500 text-amber-500 hover:text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <FiZap className="text-sm" />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              title="Tambah ke Keranjang"
              className="p-1.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <FiShoppingCart className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ==================== STATUS BADGE ====================
export function StatusBadge({ status }) {
  const map = {
    pending: { label: "Menunggu", cls: "bg-yellow-100 text-yellow-700" },
    processing: { label: "Diproses", cls: "bg-blue-100 text-blue-700" },
    shipped: { label: "Dikirim", cls: "bg-purple-100 text-purple-700" },
    delivered: { label: "Selesai", cls: "bg-emerald-100 text-emerald-700" },
    cancelled: { label: "Dibatalkan", cls: "bg-red-100 text-red-700" },
  };
  const { label, cls } = map[status] || { label: status, cls: "bg-gray-100 text-gray-700" };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>;
}

// ==================== LOADING ====================
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );
}

// ==================== EMPTY STATE ====================
export function EmptyState({ icon = "🐾", title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-6xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-6">{desc}</p>
      {action}
    </div>
  );
}

// ==================== UTILS ====================
// ==================== IMAGE UPLOAD FIELD ====================
// Komponen pilih foto langsung dari galeri device (input file + preview),
// otomatis upload ke server dan mengembalikan URL lewat onChange.
export function ImageUploadField({ value, onChange, shape = "square", label = "Pilih Foto" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, WEBP, GIF).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB.");
      return;
    }

    setUploading(true);
    try {
      const res = await uploadService.uploadImage(file);
      onChange(res.data.url);
      toast.success("Foto berhasil diupload!");
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal mengupload foto.";
      toast.error(msg);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const isCircle = shape === "circle";
  const boxCls = isCircle ? "w-24 h-24 rounded-2xl" : "w-32 h-32 rounded-xl";

  return (
    <div className={isCircle ? "" : "space-y-2"}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex items-center gap-3">
        <div className={`relative ${boxCls} overflow-hidden border-2 border-gray-200 bg-gray-50 flex-shrink-0 flex items-center justify-center`}>
          {value ? (
            <img src={value} alt="preview" className="w-full h-full object-cover" onError={e => e.target.src = "https://via.placeholder.com/128?text=Error"} />
          ) : (
            <FiImage className="text-gray-300 text-2xl" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-emerald-400 text-emerald-600 hover:bg-emerald-50 font-semibold text-sm transition-colors disabled:opacity-50"
          >
            <FiCamera /> {uploading ? "Mengupload..." : label}
          </button>
          <p className="text-xs text-gray-400">JPG, PNG, WEBP, atau GIF · maks 5MB</p>
        </div>
      </div>
    </div>
  );
}

export function formatRupiah(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}
