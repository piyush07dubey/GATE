import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { FiMail, FiLock, FiUser, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name);
      }
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
      // OAuth redirects, so we don't navigate here
    } catch (error) {
      toast.error('Google sign in failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg"></div>
      
      <div className="auth-card">
        <Link to="/" className="btn btn-ghost btn-sm" style={{ position: 'absolute', top: '16px', left: '16px', paddingLeft: 0 }}>
          <FiArrowLeft /> Back
        </Link>
        
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)', marginTop: 'var(--space-md)' }}>
          <img src="/gateforge-logo.png" alt="GATEForge" style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', margin: '0 auto var(--space-sm)', display: 'block', objectFit: 'cover' }} />
          <h1 className="auth-title">Welcome to GATEForge</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to continue your preparation' : 'Create an account to start learning'}
          </p>
        </div>

        <button 
          className="google-btn" 
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          <FcGoogle size={20} />
          {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
        </button>

        <div className="auth-divider">or continue with email</div>

        <form className="auth-form" onSubmit={handleEmailAuth}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <FiUser style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                <input 
                  type="text" 
                  className="input" 
                  placeholder="John Doe" 
                  style={{ paddingLeft: '36px' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
              <input 
                type="email" 
                className="input" 
                placeholder="you@example.com" 
                style={{ paddingLeft: '36px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Password</label>
              {isLogin && <a href="#" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent-cyan)' }}>Forgot?</a>}
            </div>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
              <input 
                type="password" 
                className="input" 
                placeholder="••••••••" 
                style={{ paddingLeft: '36px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: 'var(--space-sm)' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? (
            <>Don't have an account? <button onClick={() => setIsLogin(false)}>Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => setIsLogin(true)}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
