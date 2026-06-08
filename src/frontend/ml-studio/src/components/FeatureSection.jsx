import React from 'react';

export default function FeatureSection({ theme, title, description, imageSrc }) {
  return (
    <section style={{
      width: '100vw',             // Forces full screen browser width
      margin: '0',                // Strips all outer margins
      padding: '1rem 0',          // Top/Bottom padding only; completely removes left/right lines
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: theme.surface,
        borderTop: `1px solid ${theme.border}`,    // Keeps clean horizontal separator
        borderBottom: `1px solid ${theme.border}`, // Keeps clean horizontal separator
        borderLeft: 'none',                        // Explicitly kills the left line
        borderRight: 'none',                       // Explicitly kills the right line
        borderRadius: '0px',                       // flattens corners for full width flow
        padding: '4.5rem 5rem',                    // Keeps text safe inside the screen edges
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        gap: '6rem',
        boxSizing: 'border-box',
        width: '100%'
      }}>
        {/* Left Side: Typography Text Block - Cleaned and forced hard-left */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem',
          textAlign: 'left',         // Snaps text lines completely left
          alignItems: 'flex-start'   // Aligns potential sub-buttons or block nodes left
        }}>
          <h2 style={{
            fontSize: '2.75rem',
            fontWeight: '400',
            letterSpacing: '-0.04em',
            margin: 0,
            color: theme.textPrimary,
            lineHeight: '1.15'
          }}>
            {title}
          </h2>
          <p style={{
            fontSize: '1.1rem',
            lineHeight: '1.65',
            color: theme.textSecondary,
            margin: 0,
            maxWidth: '520px'
          }}>
            {description}
          </p>
        </div>

        {/* Right Side: Clean Muted Gray Graphic Frame Box */}
        <div style={{
          width: '100%',
          backgroundColor: '#eef2f6', // Clean light gray-mix panel accent
          borderRadius: '12px',
          border: `1px solid ${theme.border}`,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          aspectRatio: '16 / 10',
          boxSizing: 'border-box',
          padding: '2rem'
        }}>
          <img 
            src={imageSrc} 
            alt="Feature Workspace Interface View" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div style="color: #718096; text-align: center; font-size: 0.85rem;">
                  <div style="font-size: 1.75rem; margin-bottom: 0.5rem; filter: brightness(0.4);">🖥️</div>
                  [ Production Asset Interface Workspace View ]
                </div>
              `;
            }}
          />
        </div>
      </div>
    </section>
  );
}