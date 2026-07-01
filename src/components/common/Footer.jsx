import { Link } from "react-router-dom";
import { GiPawPrint } from "react-icons/gi";
import { FiInstagram, FiTwitter, FiFacebook } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/LOGO.png" alt="Petopia Logo" className="h-9 w-9 object-contain" />
              <span className="text-xl font-bold text-white">Petopia</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">Marketplace hewan peliharaan terpercaya di Indonesia. Happy Pets, Happy Owners.</p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://www.instagram.com/petopia.id__?igsh=MXd4czkxc2plcHY0Ng=="
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-emerald-600 rounded-lg transition-colors"
              >
                <FiInstagram />
              </a>
              
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Jelajahi</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/katalog-hewan" className="hover:text-emerald-400 transition-colors">Katalog Hewan</Link></li>
              <li><Link to="/katalog-produk" className="hover:text-emerald-400 transition-colors">Katalog Produk</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Jadi Seller</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Bantuan</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Cara Pembelian</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Hubungi Kami</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Kontak</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📧 idpetopia@gmail.com</li>
              <li>📍 Malang, Indonesia</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© 2026 Petopia. All rights reserved.</p>
          <p>Dibuat dengan ❤️ untuk para pecinta hewan</p>
        </div>
      </div>
    </footer>
  );
}
