
import {
  createBrowserRouter,
  Navigate,
} from 'react-router-dom';

import {
  ProtectedRoute,
} from '../features/auth/components/ProtectedRoute';

import {
  LoginPage,
} from '../features/auth/pages/LoginPage';

import {
  ForbiddenPage,
} from '../features/auth/pages/ForbiddenPage';

import {
  AppLayout,
} from '../components/layout/AppLayout/AppLayout';

import {
  DashboardPage,
} from '../features/dashboard/pages/DashboardPage';

import {
  ApisPage,
} from '../features/apis/pages/ApisPage';

import {
  ApiProvider,
} from '../features/apis/context/ApiProvider';

import {
  ApiDetailPage,
} from '../features/apis/pages/ApiDetailPage';

import {
  RulesPage,
} from '../features/rules/pages/RulesPage';

import {
  EvaluationsPage,
} from '../features/evaluations/pages/EvaluationsPage';

import {
  EvaluationDetailPage,
} from '../features/evaluations/pages/EvaluationDetailPage';

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
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'apis',
        element: <ApisPage />,
      },
      {
        path: 'apis/:apiId',
        element: <ApiDetailPage />,
      },
      {
        path: 'rules',
        element: <RulesPage />,
      },
      {
        path: 'evaluations',
        element: <EvaluationsPage />,
      },
      {
        path: 'evaluations/:evaluationId',
        element: <EvaluationDetailPage />,
      },

      // Acceso denegado para usuarios autenticados
      // que no tienen permisos suficientes.
      {
        path: 'forbidden',
        element: <ForbiddenPage />,
      },
    ],
  },
]);
