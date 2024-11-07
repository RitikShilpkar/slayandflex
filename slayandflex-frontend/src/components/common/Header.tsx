import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector((state) => state.cart.items);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/'); // Redirect to home page after logout
  };

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuOpen
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Cleanup the event listener on component unmount
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className={styles['header']}>
      <Link to="/" className={styles['logo']}>
      Slay and Flex
      </Link>
      <div className={styles['menu-icon']} onClick={handleMenuToggle}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <nav
        ref={menuRef}
        className={`${styles['nav-links']} ${menuOpen ? styles['active'] : ''}`}
      >
        <Link to="/brand-promotion" onClick={() => setMenuOpen(false)}>
          Brand Promotion
        </Link>
        <Link to="/shop" onClick={() => setMenuOpen(false)}>
          Shop
        </Link>
        <Link to="/cart" onClick={() => setMenuOpen(false)}>
          Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
        </Link>
        {user ? (
          <>
            <Link to="/profile" onClick={() => setMenuOpen(false)}>
              Profile
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className={styles['logout-button']}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}>
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
