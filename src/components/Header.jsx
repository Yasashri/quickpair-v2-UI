import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Header() {
  const location = useLocation();
  const { isAuthenticated, logout, isAdminAuthenticated, adminLogout } =
    useAuth();

  const isAdminArea = location.pathname.startsWith("/admin");

  return (
    <header className='topbar'>
      <div className='container nav'>
        <div className='nav__brand'>
          <Link to='/'><img className="logo" src="/qplogo_no_text.png" alt="logo" /><p>Quick<span>Pair</span></p></Link>
        </div>
        <nav className='nav__links'>
          {isAdminArea ? (
            <>
              <Link to='/admin/dashboard'>Dashboard</Link>
              {isAdminAuthenticated ? (
                <button
                  type='button'
                  className='link-button'
                  onClick={adminLogout}
                >
                  Logout
                </button>
              ) : (
                <Link to='/admin/login'>Admin Login</Link>
              )}
            </>
          ) : (
            <>
              <Link to='/profiles'>Browse</Link>
              <Link to='/me'>My Profile</Link>
              <Link to='/messages'>Messages</Link>
              {isAuthenticated ? (
                <button type='button' className='link-button' onClick={logout}>
                  Logout
                </button>
              ) : (
                <>
                  <Link to='/login'>Login</Link>
                  <Link to='/register'>Register</Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
