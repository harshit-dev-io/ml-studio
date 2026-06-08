import React from 'react';

export default function Footer({ theme }) {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: `1px solid ${theme.border}`,
      padding: '3.5rem 3rem 3rem 3rem',
      backgroundColor: 'transparent',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        {/* Footnote Directories */}
        <div style={{ display: 'flex', gap: '2.5rem', fontSize: '0.85rem', fontWeight: '500' }}>
          <span style={{ cursor: 'pointer', color: theme.textSecondary }}>Company</span>
          <span style={{ cursor: 'pointer', color: theme.textSecondary }}>Resources</span>
          <span style={{ cursor: 'pointer', color: theme.textSecondary }}>Legal</span>
          <span style={{ cursor: 'pointer', color: theme.textSecondary }}>Privacy Policy</span>
        </div>

        {/* Monochromatic Copyright Brand Stamp */}
        <div style={{ fontSize: '0.8rem', color: theme.textSecondary, letterSpacing: '0.02em' }}>
          Copyright © 2026 ML Studio
        </div>
      </div>
    </footer>
  );
}