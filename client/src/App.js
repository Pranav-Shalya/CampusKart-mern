import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { CssBaseline, Box } from "@mui/material";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import NewListingPage from "./pages/NewListingPage";
import ProfilePage from "./pages/ProfilePage";
import BottomNav from "./components/BottomNav";
import { AuthProvider } from "./context/AuthContext";
import BuyPage from "./pages/BuyPage";
import ChatPage from "./pages/ChatPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import NotificationsPage from "./pages/NotificationsPage";
function AppInner() {
  const location = useLocation();
  const showBottomNav = !["/login", "/register"].includes(location.pathname);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: showBottomNav ? 7 : 0,
        bgcolor: "#f5f7fb"
      }}
    >
      <CssBaseline />
      <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/sell" element={<NewListingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/buy" element={<BuyPage />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
          <Route path="/order/:id" element={<OrderDetailPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </Box>
      {showBottomNav && <BottomNav />}
    </Box>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
