import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiChevronDown } from 'react-icons/fi';
import gsap from 'gsap';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const links = document.querySelectorAll('.navbar-link');
    gsap.fromTo(links,
      { y: -12, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out',
        delay: 0.2,
      }
    );
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const navLinks = [
    { name: 'Subjects', path: '/subjects' },
    { name: 'PYQs', path: '/pyq/all' },
    { name: 'Drawing Board', path: '/drawing-board' },
    { name: 'Notes', path: '/notes' },
    { name: 'Resources', path: '/resources' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path.split('/').slice(0, 2).join('/'));
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src="/gateforge-logo.png" alt="GATEForge" className="logo-img" />
          <span className="logo-text-gradient">GATEForge</span>
        </Link>

        <div className={`navbar-links ${isMobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}

          {/* Mobile Auth Links */}
          {isMobileMenuOpen && !user && (
            <Link to="/auth" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Sign In
            </Link>
          )}
          {isMobileMenuOpen && user && (
            <button onClick={handleSignOut} className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }}>
              Sign Out
            </button>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="hidden-mobile" style={{ position: 'relative' }}>
              <div
                className="navbar-user"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="navbar-avatar">
                  {user.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                  {user.user_metadata?.full_name?.split(' ')[0] || 'Student'}
                </span>
                <FiChevronDown style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }} />
              </div>

              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-xs)',
                  minWidth: '160px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 200,
                }}>
                  <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '0.25rem' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>LOGGED IN AS</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{user.email}</div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px' }}
                  >
                    <FiLogOut /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary hidden-mobile">
              Sign In
            </Link>
          )}

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
