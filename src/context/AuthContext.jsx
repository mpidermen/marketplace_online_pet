import { createContext, useContext, useState, useEffect } from "react";
import api, { authService } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("petopia_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("petopia_cart");
    return stored ? JSON.parse(stored) : [];
  });

  // Item "Beli Sekarang" — terpisah dari cart, hanya dipakai sekali saat checkout langsung
  const [buyNowItem, setBuyNowItem] = useState(() => {
    const stored = sessionStorage.getItem("petopia_buynow");
    return stored ? JSON.parse(stored) : null;
  });

  // Validasi token tersimpan ke server saat aplikasi pertama dibuka.
  // Kalau akun sudah dihapus/di-reset (mis. setelah db:fresh) tapi browser
  // masih menyimpan sesi lama di localStorage, otomatis logout di sini.
  useEffect(() => {
    const stored = localStorage.getItem("petopia_user");
    if (!stored) return;
    authService.me().catch(() => {
      setUser(null);
      localStorage.removeItem("petopia_user");
    });
  }, []);

  // Sync cart ke localStorage
  useEffect(() => {
    localStorage.setItem("petopia_cart", JSON.stringify(cart));
  }, [cart]);

  // Sync buyNowItem ke sessionStorage (hanya untuk durasi tab/sesi saat ini)
  useEffect(() => {
    if (buyNowItem) sessionStorage.setItem("petopia_buynow", JSON.stringify(buyNowItem));
    else sessionStorage.removeItem("petopia_buynow");
  }, [buyNowItem]);

  // ─── AUTH ──────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { user: userData, token } = res.data;
    const fullUser = { ...userData, token };
    setUser(fullUser);
    localStorage.setItem("petopia_user", JSON.stringify(fullUser));
    return fullUser;
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    const { user: userData, token } = res.data;
    const fullUser = { ...userData, token };
    setUser(fullUser);
    localStorage.setItem("petopia_user", JSON.stringify(fullUser));
    return fullUser;
  };

  // Update sebagian data user (mis. setelah edit profil/avatar) tanpa logout.
  // Token tetap dipertahankan karena tidak ikut dikirim balik dari endpoint profil.
  const updateUser = (partialUser) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...partialUser };
      localStorage.setItem("petopia_user", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    setBuyNowItem(null);
    localStorage.removeItem("petopia_user");
    localStorage.removeItem("petopia_cart");
    sessionStorage.removeItem("petopia_buynow");
  };

  // ─── CART (tetap local state, sync ke backend saat checkout) ───
  const addToCart = (item) => {
    setCart(prev => {
      const key = `${item.type}-${item.id}`;
      const existing = prev.find(c => `${c.type}-${c.id}` === key);
      if (existing) {
        return prev.map(c =>
          `${c.type}-${c.id}` === key
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (type, id) => {
    setCart(prev => prev.filter(c => !(c.type === type && c.id === id)));
  };

  const updateCartQty = (type, id, quantity) => {
    if (quantity <= 0) return removeFromCart(type, id);
    setCart(prev =>
      prev.map(c => c.type === type && c.id === id ? { ...c, quantity } : c)
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("petopia_cart");
  };

  // ─── BELI SEKARANG (terpisah dari cart) ─────────────────────────
  const buyNow = (item) => {
    // quantity default = 1, tidak menyentuh cart sama sekali
    setBuyNowItem({ ...item, quantity: 1 });
  };

  const updateBuyNowQty = (quantity) => {
    setBuyNowItem(prev => {
      if (!prev) return prev;
      const qty = Math.max(1, Math.min(quantity, prev.stock || quantity));
      return { ...prev, quantity: qty };
    });
  };

  const clearBuyNow = () => {
    setBuyNowItem(null);
    sessionStorage.removeItem("petopia_buynow");
  };

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);
  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  return (
    <AuthContext.Provider value={{
      user, login, logout, register, updateUser,
      cart, addToCart, removeFromCart, updateCartQty, clearCart,
      cartCount, cartTotal,
      buyNowItem, buyNow, updateBuyNowQty, clearBuyNow,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
