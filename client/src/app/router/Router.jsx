import React from "react";
import { createBrowserRouter, Navigate } from "react-router";

import Layout from "../layout/Layout";

export default function Router() {
  return createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
    },
  ]);
}
