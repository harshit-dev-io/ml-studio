import React, { useState, useEffect } from 'react';

export default function HeroSection({ theme }) {
  const [typedText, setTypedText] = useState('');
  const fullPhrase = '  Build with no code.';
  
  // Clean native typing animation engine
  useEffect(() => {
    let index = 0;
    setTypedText(''); // Reset canvas on mount
    
    const typingInterval = setInterval(() => {
      if (index < fullPhrase.length) {
        // Use functional state updates to prevent stale closures in Chrome
        setTypedText((prev) => prev + fullPhrase.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100); // Speed of the typing typing effect (in milliseconds)

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <section style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',    // Absolute horizontal center alignment
      justifyContent: 'center',  // Vertical center alignment
      padding: '8rem 2rem 4rem 2rem',
      boxSizing: 'border-box',
      backgroundColor: theme.background,
      textAlign: 'center',
      border: 'none'
    }}>
      
      {/* 1. Centered Brand Identity Stack */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <img 
          src="/logo.png"
          alt="ML Studio Logo"
          style={{ height: '32px', width: 'auto', display: 'block', objectFit: 'contain' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div style={{ display: 'none', width: '26px', height: '26px', backgroundColor: '#000000', borderRadius: '6px' }} />
        
        <span style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          letterSpacing: '-0.03em',
          color: theme.textPrimary
        }}>
          ML Studio
        </span>
      </div>

      {/* 2. Animated Typing Display */}
      <h1 style={{
        fontSize: 'clamp(2.25rem, 6vw, 4rem)',
        fontWeight: '800',
        letterSpacing: '-0.04em',
        color: theme.textPrimary,
        margin: '0 0 3rem 0',
        minHeight: '4.5rem', // Structural lock to prevent layout shifting while typing
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {typedText}
        {/* Blinking Minimalist Text Cursor */}
        <span style={{
          marginLeft: '4px',
          fontWeight: '300',
          animation: 'blink 0.8s infinite',
          color: theme.textSecondary
        }}>|</span>
      </h1>

      {/* 3. High-Contrast Interactive Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        flexWrap: 'wrap'
      }}>
        {/* Login Button: Gray-Mix / Minimalist Borderless */}
        <button style={{
          padding: '0.75rem 2rem',
          fontSize: '0.95rem',
          fontWeight: '600',
          backgroundColor: 'transparent',
          color: theme.textPrimary,
          border: `1px solid rgba(0, 0, 0, 0.15)`,
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}>
          Login
        </button>

        {/* Get Started Button: Premium Stark Charcoal Black */}
        <button style={{
          padding: '0.75rem 2rem',
          fontSize: '0.95rem',
          fontWeight: '600',
          backgroundColor: '#000000',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease',
        }}>
          Get Started
        </button>
      </div>

      {/* Injected CSS Animation Keyframe for Cursor Blinking */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}