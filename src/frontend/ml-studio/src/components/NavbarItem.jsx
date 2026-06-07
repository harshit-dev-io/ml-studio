import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function NavbarItem({ icon, label, onClick, badge }) {
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.75rem',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '4px',
        color: theme.textPrimary,
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bgHover}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {icon && <span style={{ display: 'flex', fontSize: '1.1rem' }}>{icon}</span>}
      {label && <span>{label}</span>}
      
      {badge && (
        <span style={{
          fontSize: '0.7rem',
          padding: '0.1rem 0.35rem',
          backgroundColor: theme.textPrimary,
          color: theme.bgMain,
          borderRadius: '10px',
          fontWeight: '700'
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}