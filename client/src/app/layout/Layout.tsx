import React from 'react';
import { Outlet } from 'react-router-dom';

type LayoutProps = {
  user?: unknown;
  logoutHandler?: () => void;
};

export default function Layout({ user, logoutHandler }: LayoutProps): JSX.Element {
  return (
    <>
      {/* Header placeholder. Add real header when ready */}
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </>
  );
}


