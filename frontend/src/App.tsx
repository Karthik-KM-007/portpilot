import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';

// Agent Views
import AgentDashboard from './pages/agent/Dashboard';
import { AgentProfile } from './pages/agent/AgentProfile';
import CreateReport from './pages/agent/CreateReport';
import MyReports from './pages/agent/MyReports';
import AgentReportView from './pages/agent/AgentReportView';

// Authority Views
import AuthorityOverview from './pages/authority/Dashboard';
import IncomingVessels from './pages/authority/IncomingVessels';
import VesselDetails from './pages/authority/VesselDetails';
import { BerthsView } from './pages/authority/BerthsView';
import { CranesView } from './pages/authority/CranesView';
import { YardView } from './pages/authority/YardView';
import { PredictionsView } from './pages/authority/PredictionsView';
import { HistoryView } from './pages/authority/HistoryView';

const ProtectedRoute = ({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: 'SHIPPING_AGENT' | 'PORT_AUTHORITY';
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'SHIPPING_AGENT' ? '/agent' : '/authority'} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'SHIPPING_AGENT' ? '/agent' : '/authority'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Shipping Agent Routes */}
      <Route
        path="/agent"
        element={
          <ProtectedRoute allowedRole="SHIPPING_AGENT">
            <AgentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/create-report"
        element={
          <ProtectedRoute allowedRole="SHIPPING_AGENT">
            <CreateReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/submit"
        element={
          <ProtectedRoute allowedRole="SHIPPING_AGENT">
            <CreateReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/my-reports"
        element={
          <ProtectedRoute allowedRole="SHIPPING_AGENT">
            <MyReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/my-vessels"
        element={
          <ProtectedRoute allowedRole="SHIPPING_AGENT">
            <MyReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/reports/:id"
        element={
          <ProtectedRoute allowedRole="SHIPPING_AGENT">
            <AgentReportView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/profile"
        element={
          <ProtectedRoute allowedRole="SHIPPING_AGENT">
            <AgentProfile />
          </ProtectedRoute>
        }
      />

      {/* Port Authority Routes */}
      <Route
        path="/authority"
        element={
          <ProtectedRoute allowedRole="PORT_AUTHORITY">
            <AuthorityOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/authority/vessels"
        element={
          <ProtectedRoute allowedRole="PORT_AUTHORITY">
            <IncomingVessels />
          </ProtectedRoute>
        }
      />
      <Route
        path="/authority/vessels/:id"
        element={
          <ProtectedRoute allowedRole="PORT_AUTHORITY">
            <VesselDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/authority/berths"
        element={
          <ProtectedRoute allowedRole="PORT_AUTHORITY">
            <BerthsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/authority/cranes"
        element={
          <ProtectedRoute allowedRole="PORT_AUTHORITY">
            <CranesView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/authority/yard"
        element={
          <ProtectedRoute allowedRole="PORT_AUTHORITY">
            <YardView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/authority/predictions"
        element={
          <ProtectedRoute allowedRole="PORT_AUTHORITY">
            <PredictionsView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/authority/history"
        element={
          <ProtectedRoute allowedRole="PORT_AUTHORITY">
            <HistoryView />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
