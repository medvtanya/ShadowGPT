import React from 'react';
import { Outlet } from 'react-router';
import Header from '../../widgets/Header/Header';

export default function Layout({ user, logoutHandler }) {
  return (
    <>
      <Header user={user} setUser={logoutHandler} />
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </>
  );
}