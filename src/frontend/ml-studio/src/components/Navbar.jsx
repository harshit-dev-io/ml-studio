import React, { useState } from 'react';

export default function Navbar({ theme }) {
  // Tracking active dropdown panels independently
  const [activeDropdown, setActiveDropdown] = useState(null);

  return (
    <nav 
      onMouseLeave={() => setActiveDropdown(null)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: '1.25rem 3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(240, 244, 248, 0.85)', // Matches light off-white background
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${theme.border}`,
        zIndex: 100,
        boxSizing: 'border-box'
      }}
    >
      {/* Brand Identity / Logo Layout */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontWeight: '700',
        fontSize: '1.2rem',
        letterSpacing: '-0.02em',
      }}>
        <img 
          src="/logo.png"
          alt="ML Studio Logo"
          style={{ height: '26px', width: 'auto', display: 'block', objectFit: 'contain' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        {/* Pitch Black Logo Box Replacement */}
        <div style={{ display: 'none', width: '22px', height: '22px', backgroundColor: '#000000', borderRadius: '4px' }} />
        <span>ML Studio</span>
      </div>

      {/* Navigation Cluster with Separate Dropdown Hotspots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
        <div style={{ display: 'flex', gap: '2.5rem', fontWeight: '500', fontSize: '0.9rem', position: 'relative' }}>
          
          {/* 1. Product Link Anchor */}
          <div 
            onMouseEnter={() => setActiveDropdown('product')}
            style={{ cursor: 'pointer', color: activeDropdown === 'product' ? theme.accent : theme.textSecondary, padding: '0.5rem 0', transition: 'color 0.2s' }}
          >
            Product ▾
          </div>

          {/* 2. Solutions Link Anchor */}
          <div 
            onMouseEnter={() => setActiveDropdown('solutions')}
            style={{ cursor: 'pointer', color: activeDropdown === 'solutions' ? theme.accent : theme.textSecondary, padding: '0.5rem 0', transition: 'color 0.2s' }}
          >
            Solutions ▾
          </div>

          {/* 3. Pricing Link Anchor */}
          <div 
            onMouseEnter={() => setActiveDropdown('pricing')}
            style={{ cursor: 'pointer', color: activeDropdown === 'pricing' ? theme.accent : theme.textSecondary, padding: '0.5rem 0', transition: 'color 0.2s' }}
          >
            Pricing ▾
          </div>

          {/* --- SEPARATE DROPDOWN PANELS RENDERING LOGIC --- */}
          
          {activeDropdown === 'product' && (
            <div style={dropdownPanelStyle(theme)}>
              <div>
                <div style={{ fontWeight: '600', color: theme.accent, fontSize: '0.85rem' }}>ML Studio Core</div>
                <div style={{ fontSize: '0.75rem', color: theme.textSecondary, marginTop: '0.25rem' }}>Visual no-code network architecture builder.</div>
              </div>
              <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '0.75rem' }}>
                <div style={{ fontWeight: '600', color: theme.accent, fontSize: '0.85rem' }}>Deployment Engine</div>
                <div style={{ fontSize: '0.75rem', color: theme.textSecondary, marginTop: '0.25rem' }}>Instant scaling backend REST execution endpoints.</div>
              </div>
            </div>
          )}

          {activeDropdown === 'solutions' && (
            <div style={{ ...dropdownPanelStyle(theme), left: '75px' }}>
              <div>
                <div style={{ fontWeight: '600', color: theme.accent, fontSize: '0.85rem' }}>Enterprise Scale</div>
                <div style={{ fontSize: '0.75rem', color: theme.textSecondary, marginTop: '0.25rem' }}>High-throughput infrastructure pipelines for teams.</div>
              </div>
              <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '0.75rem' }}>
                <div style={{ fontWeight: '600', color: theme.accent, fontSize: '0.85rem' }}>Research & Biotech</div>
                <div style={{ fontSize: '0.75rem', color: theme.textSecondary, marginTop: '0.25rem' }}>Heavy computer vision data parsing.</div>
              </div>
            </div>
          )}

          {activeDropdown === 'pricing' && (
            <div style={{ ...dropdownPanelStyle(theme), left: '160px', width: '220px' }}>
              <div>
                <div style={{ fontWeight: '600', color: theme.accent, fontSize: '0.85rem' }}>Developer Tier</div>
                <div style={{ fontSize: '0.75rem', color: theme.textSecondary, marginTop: '0.25rem' }}>Free access endpoints for builders.</div>
              </div>
              <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '0.75rem' }}>
                <div style={{ fontWeight: '600', color: theme.accent, fontSize: '0.85rem' }}>Scale Plan</div>
                <div style={{ fontSize: '0.75rem', color: theme.textSecondary, marginTop: '0.25rem' }}>Pay-as-you-go GPU compute nodes.</div>
              </div>
            </div>
          )}

        </div>

        {/* Premium Deep Charcoal Black Button Accent */}
        {/* 1. Add click toggle onto the primary action button inside Navbar.jsx */}
<button 
  onClick={() => {theme.setIsSignUp(true);theme.onNavigate('login');}}
  style={{
    padding: '0.6rem 1.5rem', fontSize: '0.875rem', fontWeight: '600',
    backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer'
  }}
>
  Get Started
</button>
      </div>
    </nav>
  );
}

// Global dynamic layout parameters for dropdown panels
const dropdownPanelStyle = (theme) => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  backgroundColor: theme.surface,
  border: `1px solid ${theme.border}`,
  borderRadius: '10px',
  padding: '1.25rem',
  width: '250px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
  zIndex: 101,
  marginTop: '0.5rem',
  boxSizing: 'border-box'
});