import { useState } from "react";
import { Routes, Route, Navigate, useLocation, Link, useNavigate } from "react-router-dom";
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
import { useNewMessage } from "./context/NewMessageContext";
import Footer from "./components/Footer";
import useAuth from "./hooks/useAuth";
import api from "./api/api";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Modal from "./components/Modal";
import AdminUserComplianceReport from "./pages/AdminUserComplianceReport";

function App() {
  const { isAuthenticated, user, refreshUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast, dismissToast } = useNewMessage();
  const [resending, setResending] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");

  const [acceptingPolicies, setAcceptingPolicies] = useState(false);
  const [policyTermsChecked, setPolicyTermsChecked] = useState(false);
  const [policyPrivacyChecked, setPolicyPrivacyChecked] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const handleAcceptPolicies = async () => {
    if (!policyTermsChecked || !policyPrivacyChecked) {
      setShowValidationModal(true);
      return;
    }
    setAcceptingPolicies(true);
    try {
      await api.post("/accept-policies");
      await refreshUser();
      setPolicyTermsChecked(false);
      setPolicyPrivacyChecked(false);
    } catch (err) {
      alert("Failed to accept policies. Please try again.");
    } finally {
      setAcceptingPolicies(false);
    }
  };

  const needsPolicyAcceptance = isAuthenticated &&
    user &&
    user.needs_policy_acceptance &&
    location.pathname !== "/terms" &&
    location.pathname !== "/privacy";

  const policyModalMessage = (
    <div style={{ textAlign: "left", marginTop: "12px" }}>
      <p style={{ marginBottom: "16px", fontSize: "0.95rem" }}>
        We have updated our Terms of Service and Privacy Policy. Please review and agree to the updated terms to continue using QuickPair.
      </p>
      
      <div className="policy-checkbox-container">
        <label className={`checkbox-label ${policyTermsChecked ? "is-checked" : ""}`}>
          <input
            type="checkbox"
            checked={policyTermsChecked}
            onChange={(e) => setPolicyTermsChecked(e.target.checked)}
          />
          <span>
            I agree to the <Link to="/terms" target="_blank" onClick={(e) => e.stopPropagation()}>Terms of Service</Link>
          </span>
        </label>

        <label className={`checkbox-label ${policyPrivacyChecked ? "is-checked" : ""}`}>
          <input
            type="checkbox"
            checked={policyPrivacyChecked}
            onChange={(e) => setPolicyPrivacyChecked(e.target.checked)}
          />
          <span>
            I agree to the <Link to="/privacy" target="_blank" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>
          </span>
        </label>
      </div>
    </div>
  );

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
    <div className='app-shell'>
      <Header />

      {toast.show && (
        <div 
          className="message-toast"
          onClick={() => {
            dismissToast();
            navigate(`/messages?userId=${toast.userId}`);
          }}
        >
          <div className="message-toast__avatar">
            <img src="/avatar.jpg" alt="new message" />
          </div>
          <div className="message-toast__content">
            <strong>{toast.senderName}</strong>
            <p>{toast.body}</p>
          </div>
          <button 
            className="message-toast__close" 
            onClick={(e) => {
              e.stopPropagation();
              dismissToast();
            }}
          >
            ✕
          </button>
        </div>
      )}

        {showVerificationBanner && (
          <div className="container global-verification-banner">
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
            <Route path='/terms' element={<Terms />} />
            <Route path='/privacy' element={<Privacy />} />
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
            <Route
              path='/admin/users/:id/compliance-report'
              element={
                <AdminProtectedRoute>
                  <AdminUserComplianceReport />
                </AdminProtectedRoute>
              }
            />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <Modal
          isOpen={Boolean(needsPolicyAcceptance)}
          onClose={() => {}}
          showClose={false}
          closeOnBackdrop={false}
          type="warning"
          title="Updated Terms & Privacy Policy"
          message={policyModalMessage}
          confirmText={acceptingPolicies ? "Saving..." : "Agree & Continue"}
          cancelText="Logout"
          confirmDisabled={acceptingPolicies}
          onConfirm={handleAcceptPolicies}
          onCancel={logout}
        />
        <Modal
          isOpen={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          type="warning"
          title="Agreement Required"
          message="Please read and agree to both the Terms of Service and Privacy Policy to continue using QuickPair."
          confirmText="OK"
        />
      </div>
  );
}

export default App;
