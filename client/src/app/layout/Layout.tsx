import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';



export default function Layout(): JSX.Element {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'var(--panel)',
        borderBottom: '1px solid #223044',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link to="/" style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          color: 'var(--text)',
          textDecoration: 'none'
        }}>
          ShadowGPT
        </Link>
        
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link 
            to="/" 
            style={{ 
              color: isHome ? 'var(--accent)' : 'var(--muted)',
              textDecoration: isHome ? 'underline' : 'none'
            }}
          >
            Upload
          </Link>
          {!isHome && (
            <Link 
              to="/" 
              style={{ 
                color: 'var(--muted)',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              ← New Chat
            </Link>
          )}
        </nav>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  );
}


