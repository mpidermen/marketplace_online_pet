import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Hanya user yang sudah login
export function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Hanya buyer
export function BuyerRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "buyer") return <Navigate to="/" replace />;
  return children;
}

// Hanya seller
export function SellerRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "seller") return <Navigate to="/" replace />;
  return children;
}

// Hanya admin
export function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

// Redirect jika sudah login
export function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "seller") return <Navigate to="/seller/dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
}
