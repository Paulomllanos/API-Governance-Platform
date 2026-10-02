import {
  createBrowserRouter,
  Navigate,
} from 'react-router-dom'

import { LoginPage } from '../features/auth/pages/LoginPage'
import { AppLayout } from '../components/layout/AppLayout/AppLayout'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])