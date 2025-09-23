import { Outlet, Link, useLocation } from 'react-router-dom';
import { ToastProvider } from '../../shared/ui/Toast';

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <ToastProvider>
      <div className="app-root">
        <header className="app-header">
          <Link to="/" className="brand">
            ShadowGPT
          </Link>
          <nav className="nav">
            <Link to="/" className={isHome ? 'nav-link active' : 'nav-link'}>
              Upload
            </Link>
            {!isHome && (
              <Link to="/" className="nav-link small">
                ← New Chat
              </Link>
            )}
          </nav>
        </header>

        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  );
}


