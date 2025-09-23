import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '../layout/Layout';
import Workspace from '../../pages/Workspace';
import NotFound from '../../pages/NotFound';

export default function Router() {
  return createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Workspace /> },
        { path: 'chat/:sessionId', element: <Workspace /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ]);
}


