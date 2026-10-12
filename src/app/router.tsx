
import { createBrowserRouter, Navigate } from "react-router-dom";

import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { AppLayout } from "../components/layout/AppLayout/AppLayout";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { ApisPage } from "../features/apis/pages/ApisPage";
import { ApiProvider } from '../features/apis/context/ApiProvider'
import { ApiDetailPage } from '../features/apis/pages/ApiDetailPage'

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <ApiProvider>
          <AppLayout />
        </ApiProvider>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "apis",
        element: <ApisPage />,
      },
      {
        path: "apis/:apiId",
        element: <ApiDetailPage />,
      },
    ],
  },
]);
