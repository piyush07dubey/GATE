import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiYoutube, FiMail, FiZap } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="navbar-logo" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              <img src="/gateforge-logo.png" alt="GATEForge" className="logo-img" />
              <span className="logo-text-gradient">GATEForge</span>
            </Link>
            <p style={{ marginTop: '1rem' }}>
              India's sharpest GATE CSE prep platform. Forged with precision — comprehensive PYQs,
              step-by-step solutions, Drawing Board, and a collaborative student community.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <FiZap style={{ color: 'var(--color-accent)', fontSize: '0.875rem' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                30 Years of GATE PYQs Indexed
              </span>
            </div>
          </div>

          <div>
            <h4 className="footer-section-title">Study Resources</h4>
            <div className="footer-links">
              <Link to="/subjects" className="footer-link">Syllabus &amp; Subjects</Link>
              <Link to="/pyq/all" className="footer-link">Previous Year Questions</Link>
              <Link to="/notes" className="footer-link">Community Notes</Link>
              <Link to="/resources" className="footer-link">Video Lectures</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-section-title">Tools</h4>
            <div className="footer-links">
              <Link to="/drawing-board" className="footer-link">Drawing Board</Link>
              <a href="#" className="footer-link">Test Series <span style={{ fontSize: '10px', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>SOON</span></a>
              <a href="#" className="footer-link">Rank Predictor <span style={{ fontSize: '10px', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>SOON</span></a>
              <a href="#" className="footer-link">Mock Tests <span style={{ fontSize: '10px', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>SOON</span></a>
            </div>
          </div>

          <div>
            <h4 className="footer-section-title">Connect</h4>
            <div className="footer-links">
              <a href="#" className="footer-link">About GATEForge</a>
              <a href="#" className="footer-link">Contact Us</a>
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} GATEForge. Built for GATE CSE aspirants.</p>
          <div className="footer-socials">
            <a href="#" className="footer-social" aria-label="Twitter"><FiTwitter /></a>
            <a href="#" className="footer-social" aria-label="YouTube"><FiYoutube /></a>
            <a href="#" className="footer-social" aria-label="GitHub"><FiGithub /></a>
            <a href="#" className="footer-social" aria-label="Email"><FiMail /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
