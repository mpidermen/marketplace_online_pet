import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { petService, reviewService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { formatRupiah, LoadingSpinner } from "../../components/common/UIComponents";
import { FiStar, FiShoppingCart, FiArrowLeft, FiCheck, FiMapPin, FiZap, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";

export default function DetailHewanPage() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ avg_rating: 0, total: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const { addToCart, buyNow, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await petService.getById(id);
        setPet(res.data);
      } catch (err) {
        setPet(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await reviewService.getByPet(id);
        setReviews(res.data || []);
        setReviewSummary(res.summary || { avg_rating: 0, total: 0 });
      } catch (err) {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) { toast.error("Login dulu!"); return; }
    addToCart({ type: "pet", id: pet.pet_id, name: pet.pet_name, price: pet.price, image: pet.image_url, stock: pet.stock });
    toast.success("Ditambahkan ke keranjang! 🛒");
  };

  const handleBuyNow = () => {
    if (!user) { toast.error("Login dulu!"); return; }
    buyNow({ type: "pet", id: pet.pet_id, name: pet.pet_name, price: pet.price, image: pet.image_url, stock: pet.stock });
    navigate("/checkout");
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20"><LoadingSpinner /></div>;
  if (!pet) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-6xl mb-4">🐾</p>
      <h2 className="text-xl font-bold text-gray-700">Hewan tidak ditemukan</h2>
      <Link to="/katalog-hewan" className="text-emerald-600 hover:underline text-sm mt-2 inline-block">← Kembali ke katalog</Link>
    </div>
  );

  const details = [
    { label: "Spesies", value: pet.species },
    { label: "Ras/Breed", value: pet.breed || "-" },
    { label: "Umur", value: `${pet.age_month} bulan` },
    { label: "Jenis Kelamin", value: pet.gender },
    { label: "Stok", value: `${pet.stock} ekor` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/katalog-hewan" className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 mb-6 transition-colors">
        <FiArrowLeft /> Kembali ke Katalog
      </Link>

      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <div className="bg-gray-50 rounded-3xl overflow-hidden aspect-square">
            <img src={pet.image_url} alt={pet.pet_name} className="w-full h-full object-cover" onError={e => e.target.src="https://via.placeholder.com/400?text=No+Image"} />
          </div>
        </div>

        <div>
          <div className="mb-2">
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">{pet.species}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{pet.pet_name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <FiStar className="text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold text-gray-700">{reviewSummary.avg_rating || pet.avg_rating || "0"}</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">{reviewSummary.total || pet.review_count || 0} ulasan</span>
            {pet.stock > 0
              ? <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium"><FiCheck /> Tersedia</span>
              : <span className="text-sm text-red-500 font-medium">Stok habis</span>
            }
          </div>

          <div className="mt-6">
            <p className="text-3xl font-bold text-emerald-600">{formatRupiah(pet.price)}</p>
          </div>

          <div className="mt-6 bg-gray-50 rounded-2xl p-4">
            <h3 className="font-bold text-gray-700 mb-3 text-sm">Detail Hewan</h3>
            <div className="grid grid-cols-2 gap-3">
              {details.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {pet.description && (
            <div className="mt-4">
              <h3 className="font-bold text-gray-700 mb-2 text-sm">Deskripsi</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{pet.description}</p>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3 bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-xl">🏪</div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Penjual</p>
              <p className="font-semibold text-gray-800 text-sm">{pet.seller_name}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><FiMapPin className="text-xs" /> {pet.seller_phone || "Indonesia"}</p>
            </div>
            <span className="bg-emerald-100 text-emerald-600 text-xs font-bold px-2 py-1 rounded-full">⭐ Terpercaya</span>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAddToCart}
              disabled={pet.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-emerald-500 hover:bg-emerald-50 disabled:border-gray-300 disabled:text-gray-400 text-emerald-600 font-bold py-4 rounded-2xl transition-colors text-sm"
            >
              <FiShoppingCart /> Tambah ke Keranjang
            </button>
            <button
              onClick={handleBuyNow}
              disabled={pet.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition-colors text-sm"
            >
              <FiZap /> Beli Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Ulasan Pembeli */}
      <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-bold text-gray-800">Ulasan Pembeli</h3>
          {reviewSummary.total > 0 && (
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <FiStar className="text-yellow-400 fill-yellow-400" /> {reviewSummary.avg_rating} ({reviewSummary.total})
            </span>
          )}
        </div>
        {reviewsLoading ? (
          <LoadingSpinner />
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Belum ada ulasan untuk hewan ini.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.review_id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 overflow-hidden">
                    {r.reviewer_avatar ? <img src={r.reviewer_avatar} alt={r.reviewer_name} className="w-full h-full object-cover" /> : <FiUser />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{r.reviewer_name}</p>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(n => (
                        <FiStar key={n} className={`text-xs ${n <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">{new Date(r.created_at).toLocaleDateString("id-ID")}</span>
                    </div>
                  </div>
                </div>
                {r.comment && <p className="text-sm text-gray-600 mt-1 ml-11">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}