import { createBrowserRouter, Navigate } from 'react-router';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Subscriptions } from './pages/Subscriptions';
import { SubscriptionDetail } from './pages/SubscriptionDetail';
import { Modules } from './pages/Modules';
import { Billing } from './pages/Billing';
import { SubscriptionLogs } from './pages/SubscriptionLogs';
import { BillingSubscriptionLogs } from './pages/BillingSubscriptionLogs';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard/subscriptions" replace />,
      },
      {
        path: 'subscriptions',
        element: <Subscriptions />,
      },
      {
        path: 'subscriptions/:id',
        element: <SubscriptionDetail />,
      },
      {
        path: 'modules',
        element: <Modules />,
      },
      {
        path: 'billing',
        element: <Billing />,
      },
      {
        path: 'subscription-log',
        element: <SubscriptionLogs />,
      },
      {
        path: 'billing-subscription-log',
        element: <BillingSubscriptionLogs />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
