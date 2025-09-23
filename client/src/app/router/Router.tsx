import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '../layout/Layout';
import Upload from '../../pages/Upload';
import NotFound from '../../pages/NotFound';

export default function Router() {
  return createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Upload /> },
        { path: 'chat/:sessionId', element: <div>Chat page placeholder</div> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ]);
}


