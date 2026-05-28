import { useState } from "react";
import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Profiles from "./pages/Profiles";
import ProfileDetail from "./pages/ProfileDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import MyProfile from "./pages/MyProfile";
import Messages from "./pages/Messages";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfileDetail from "./pages/AdminProfileDetail";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { NewMessageProvider } from "./context/NewMessageContext";
import Footer from "./components/Footer";
import useAuth from "./hooks/useAuth";
import api from "./api/api";

function App() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [resending, setResending] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");

  const handleResendVerification = async () => {
    setResending(true);
    setBannerMessage("");
    try {
      const response = await api.post("/email/resend");
      setBannerMessage(response.data.message || "OTP code sent!");
      setTimeout(() => setBannerMessage(""), 5000);
    } catch (err) {
      setBannerMessage("Failed to send OTP.");
      setTimeout(() => setBannerMessage(""), 5000);
    } finally {
      setResending(false);
    }
  };

  const showVerificationBanner = isAuthenticated && user && !user.email_verified_at && location.pathname !== "/verify-email";

  return (
    <NewMessageProvider>
      <div className='app-shell'>
        <Header />

        {showVerificationBanner && (
          <div className="global-verification-banner">
            <span>⚠️ Your email address is not verified. Please verify your email to unlock all features.</span>
            <div className="banner-actions">
              <Link to="/verify-email" className="banner-link">Verify Now</Link>
              <button onClick={handleResendVerification} disabled={resending} className="banner-button">
                {resending ? "Resending..." : "Resend Code"}
              </button>
              {bannerMessage && <span className="banner-message">{bannerMessage}</span>}
            </div>
          </div>
        )}

        <main className='page-container'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/profiles' element={<Profiles />} />
            <Route path='/profiles/:id' element={<ProfileDetail />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/reset-password' element={<ResetPassword />} />
            <Route
              path='/verify-email'
              element={
                <ProtectedRoute>
                  <VerifyEmail />
                </ProtectedRoute>
              }
            />
            <Route
              path='/me'
              element={
                <ProtectedRoute>
                  <MyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path='/messages'
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route path='/admin/login' element={<AdminLogin />} />
            <Route
              path='/admin/dashboard'
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path='/admin/profiles/:id'
              element={
                <AdminProtectedRoute>
                  <AdminProfileDetail />
                </AdminProtectedRoute>
              }
            />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </NewMessageProvider>
  );
}

export default App;
