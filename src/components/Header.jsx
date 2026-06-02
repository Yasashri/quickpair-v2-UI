import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useNewMessage } from "../context/NewMessageContext";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const { isAuthenticated, logout, isAdminAuthenticated, adminLogout, isProfileApproved } =
    useAuth();
  const { count, setCount } = useNewMessage();

  const isAdminArea = location.pathname.startsWith("/admin");

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  const handleAdminLogout = () => {
    adminLogout();
    closeMenu();
  };

  return (
    <header className="topbar">
      <div className="container nav">
        <div className="nav__brand">
          <Link to="/" onClick={closeMenu}>
            <img className="logo" src="/qplogo_no_text.png" alt="QuickPair logo" />
            <p>
              Quick<span>Pair</span>
            </p>
          </Link>
        </div>

        <button
          type="button"
          className={`nav__toggle ${menuOpen ? "is-open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav__links ${menuOpen ? "is-open" : ""}`}>
          {isAdminArea ? (
            <>
              <Link to="/admin/dashboard" onClick={closeMenu}>
                Dashboard
              </Link>

              {isAdminAuthenticated ? (
                <button
                  type="button"
                  className="link-button"
                  onClick={handleAdminLogout}
                >
                  Logout
                </button>
              ) : (
                <Link to="/admin/login" onClick={closeMenu}>
                  Admin Login
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/" onClick={closeMenu}>
                Home
              </Link>

              <Link to="/profiles" onClick={closeMenu}>
                Members
              </Link>

              <Link to="/me" onClick={closeMenu}>
                My Profile
              </Link>

              <Link to="/messages" onClick={closeMenu}>
                Messages{count > 0 ? (<span className="badge">{count}</span>) : null}
              </Link>

              {isAuthenticated ? (
                <button
                  type="button"
                  className="link-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu}>
                    Login
                  </Link>

                  <Link to="/register" onClick={closeMenu}>
                    Register
                  </Link>
                </>
              )}

              {/* Mobile drawer policy links */}
              <div className="mobile-only-footer">
                <Link to="/terms" onClick={closeMenu}>
                  Terms of Service
                </Link>
                <span className="separator">•</span>
                <Link to="/privacy" onClick={closeMenu}>
                  Privacy Policy
                </Link>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;