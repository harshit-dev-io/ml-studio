import React, { useState, useEffect, useRef } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup 
} from 'firebase/auth';
import { auth } from '../js/firebase-config';

export default function LoginScreen({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const canvasRef = useRef(null);

  const theme = {
    background: '#f0f4f8',      // Cool off-white right side
    visualPanel: '#000000',     // Deep pure black left side
    textPrimary: '#1a202c',     
    textSecondary: '#5a6578',   
    surface: '#ffffff',         
    border: 'rgba(0, 0, 0, 0.08)'
  };

  // HTML5 Canvas Interactive Neural Network Background Animation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    // Node setup
    const numNodes = 45;
    const nodes = [];
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw background network lattice paths
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 0.75;
      for (let i = 0; i < numNodes; i++) {
        for (let j = i + 1; j < numNodes; j++) {
          const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[j].x);
            ctx.lineTo(nodes[i].y, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Render standalone synaptic points
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Boundaries motion updates
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogin = async (e) => {
  e.preventDefault();
  setErrorMsg('');
  try {
    let userCredential;
    if (theme.isSignUp) {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } else {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    }

    // --- TOKEN CONSOLE EXTRACTION BLOCK ---
    // temporary: Logging the Firebase user ID token for API testing integration
    const token = await userCredential.user.getIdToken();
    console.log("temporary: Captured Firebase Auth JWT Token ->", token);

    if (onNavigate) onNavigate('dashboard');
  } catch (error) {
    console.error(error);
    setErrorMsg(theme.isSignUp ? 'Registration failed. Email might already be registered.' : 'Invalid credentials. Please double check your details.');
  }
};

  const handleGoogleAuth = async () => {
  setErrorMsg('');
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    
    // --- TOKEN CONSOLE EXTRACTION BLOCK ---
    // temporary: Logging the Firebase user ID token for API testing integration
    const token = await result.user.getIdToken();
    console.log("temporary: Captured Firebase Google OAuth JWT Token ->", token);

    if (onNavigate) onNavigate('dashboard');
  } catch (error) {
    console.error(error);
    setErrorMsg('Google Authentication was cancelled or encountered a network error.');
  }
};

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'grid',
      gridTemplateColumns: '1fr 1.1fr', // Clean proportional split screen division
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      
      {/* LEFT SIDE: Professional Visual Showcase Panel */}
      <div style={{
        backgroundColor: theme.visualPanel,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3.5rem',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Animated Canvas Mesh Layer */}
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />

        {/* Content Overlay */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img 
            src="/logo.png"
            alt="ML Studio Logo"
            style={{ height: '28px', width: 'auto', display: 'block', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div style={{ display: 'none', width: '24px', height: '24px', backgroundColor: '#ffffff', borderRadius: '4px' }} />
          <span style={{ fontSize: '1.35rem', fontWeight: '700', letterSpacing: '-0.02em', color: '#ffffff' }}>
            ML Studio
          </span>
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '420px', marginBottom: '20rem',textAlign: 'left',         // Snaps text lines completely left
          alignItems: 'flex-start' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '400', color: '#ffffff', letterSpacing: '-0.03em', lineHeight: '1.2', margin: '0 0 1rem 0' }}>
            Architect intelligence.
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '1rem', lineHeight: '1.5', margin: 0 }}>
            Design, test, and deploy enterprise-grade machine learning models instantly through a seamless, full-width visual workspace.          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Clean Left-Aligned Authentication Interface Engine */}
      <div style={{
        backgroundColor: theme.background,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start', // Hard left alignment for all input parameters
        padding: '10% 12%',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        <div style={{height: '100%', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
          
          {/* Section Introduction Greeting */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '1 rem', margin: 0, color: theme.textPrimary }}>
              Hi, welcome to ML Studio
            </h1>
            <p style={{ color: theme.textSecondary, fontSize: '0.95rem', margin: 0 }}>
              {theme.isSignUp ? 'Get started with your platform workspace.' : 'Login to your account .'}
            </p>
          </div>

          {/* 1. Google Single-Sign-On Framework Action */}
          <button type="button" onClick={handleGoogleAuth}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: theme.textPrimary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              transition: 'background-color 0.2s'
            }}
          >
            {/* Minimalist SVG Vector Representation of Google Badge Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ display: 'block' }}>
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.416 1.872 15.62 1 12.24 1 5.92 1 1 5.92 1 12s4.92 11 11.24 11c6.6 0 11-4.65 11-11.19 0-.75-.08-1.32-.2-1.81H12.24z"/>
            </svg>
            {theme.isSignUp ? 'Sign up with Google' : 'Continue with Google'}
          </button>

          {/* Horizontal Split Line Divider Context */}
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '1rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(0,0,0,0.06)' }} />
            <span style={{ fontSize: '0.75rem', color: '#a0aec0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(0,0,0,0.06)' }} />
          </div>

          {/* 2. Core Form Body Block */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: theme.textPrimary }}>Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '90%', padding: '0.75rem 1rem', border: `1px solid ${theme.border}`,
                  backgroundColor: theme.surface, borderRadius: '8px', fontSize: '0.95rem', color: theme.textPrimary, outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: theme.textPrimary }}>Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '90%', padding: '0.75rem 1rem', border: `1px solid ${theme.border}`,
                  backgroundColor: theme.surface, borderRadius: '8px', fontSize: '0.95rem', color: theme.textPrimary, outline: 'none'
                }}
              />
            </div>

            {errorMsg && (
              <div style={{ color: '#e53e3e', fontSize: '0.85rem', textAlign: 'left', fontWeight: '500' }}>{errorMsg}</div>
            )}

            <button type="submit" style={{
              width: '100%', padding: '0.85rem', backgroundColor: '#000000', color: '#ffffff',
              fontSize: '0.95rem', fontWeight: '600', border: 'none', borderRadius: '8px',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', margin: '0.5rem 0 0 0'
            }}>
              {theme.isSignUp ? 'Create Account' : 'Log In'}
            </button>
          </form>

          {/* 3. Account Creation Prompt Link Redirect */}
          <div style={{ fontSize: '0.9rem', color: theme.textSecondary, textAlign: 'left', margin: 0 }}>
            {theme.isSignUp ? 'Already have an account? ' : "Don't have an account? "}{' '}
            <span 
              onClick={() => {
                theme.settheme.isSignUp(!theme.isSignUp);
                setErrorMsg('');
              }} 
              style={{ color: '#000000', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {theme.isSignUp ? 'Log in' : 'Get started'}
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}