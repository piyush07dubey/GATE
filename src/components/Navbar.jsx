import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import toast from 'react-hot-toast';

gsap.registerPlugin(ScrollTrigger);

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

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">G</div>
          <span className="logo-text-gradient">GATE Platform</span>
        </Link>

        <div className={`navbar-links ${isMobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${location.pathname.startsWith(link.path.split('/')[1]) ? 'active' : ''}`}
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
                  minWidth: '150px',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <button 
                    onClick={handleSignOut}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
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
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
