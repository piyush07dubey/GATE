import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiYoutube, FiMail } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="navbar-logo" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              <div className="logo-icon">G</div>
              <span className="logo-text-gradient">GATE Platform</span>
            </Link>
            <p>
              Premium GATE CSE preparation platform focused on deep conceptual understanding. 
              Featuring comprehensive PYQs, 3D interactive elements, and a collaborative student community.
            </p>
          </div>
          
          <div>
            <h4 className="footer-section-title">Resources</h4>
            <div className="footer-links">
              <Link to="/subjects" className="footer-link">Syllabus & Subjects</Link>
              <Link to="/pyq/all" className="footer-link">Previous Year Questions</Link>
              <Link to="/notes" className="footer-link">Community Notes</Link>
              <Link to="/resources" className="footer-link">Video Lectures</Link>
            </div>
          </div>
          
          <div>
            <h4 className="footer-section-title">Tools</h4>
            <div className="footer-links">
              <Link to="/drawing-board" className="footer-link">Excalidraw Whiteboard</Link>
              <a href="#" className="footer-link">Test Series (Coming Soon)</a>
              <a href="#" className="footer-link">Rank Predictor (Coming Soon)</a>
            </div>
          </div>
          
          <div>
            <h4 className="footer-section-title">Connect</h4>
            <div className="footer-links">
              <a href="#" className="footer-link">About Us</a>
              <a href="#" className="footer-link">Contact</a>
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Service</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} GATE Platform. Inspired by GO Classes.</p>
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
