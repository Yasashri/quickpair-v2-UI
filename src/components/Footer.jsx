import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='site-footer'>
      <div className='container site-footer__inner'>
        <div className='site-footer__brand'>
          <Link to='/' className='site-footer__logo'>
            <img src='/qplogo_no_text.png' alt='QuickPair logo' />
            <p>
              Quick<span>Pair</span>
            </p>
          </Link>

          <p className='site-footer__text'>
            Connecting food lovers and romantics for meaningful dinner dates,
            coffee chats, and real conversations.
          </p>
        </div>

        <div className='site-footer__links'>
          <div>
            <h3>Explore</h3>
            <Link to='/profiles'>Browse profiles</Link>
            <Link to='/me'>My profile</Link>
            <Link to='/messages'>Messages</Link>
          </div>

          <div>
            <h3>Account</h3>
            <Link to='/login'>Login</Link>
            <Link to='/register'>Register</Link>
          </div>

          <div>
            <h3>Admin</h3>
            <Link to='/admin/login'>Admin login</Link>
          </div>
        </div>
      </div>

      <div className='container site-footer__bottom'>
        <p>© {currentYear} QuickPair. All rights reserved.</p>
        <p>Made with❤️ by Seran Labs.</p>
      </div>
    </footer>
  );
}

export default Footer;
