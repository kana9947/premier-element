import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';

// Pages publiques
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Pages Entreprise
import EnterpriseDashboard from './pages/enterprise/Dashboard';
import EnterpriseMissions from './pages/enterprise/Missions';
import EnterpriseContracts from './pages/enterprise/Contracts';
import EnterprisePresence from './pages/enterprise/Presence';
import EnterpriseReports from './pages/enterprise/Reports';

// Pages Manager
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerMissions from './pages/manager/Missions';
import ManagerCreateMission from './pages/manager/CreateMission';
import ManagerWorkers from './pages/manager/Workers';
import ManagerWorkerDetail from './pages/manager/WorkerDetail';
import ManagerTimeValidation from './pages/manager/TimeValidation';
import ManagerCompanies from './pages/manager/Companies';
import ManagerReports from './pages/manager/Reports';

// Pages Travailleur — Quarts
import AvailableShifts from './pages/worker/shifts/AvailableShifts';
import ShiftDetail from './pages/worker/shifts/ShiftDetail';
import MyShifts from './pages/worker/my-shifts/MyShifts';
import Billing from './pages/worker/billing/Billing';
import Notifications from './pages/worker/notifications/Notifications';

// Pages Travailleur — Profil
import ProfileHub from './pages/worker/profile/ProfileHub';
import AccountInfo from './pages/worker/profile/AccountInfo';
import PositionsExperience from './pages/worker/profile/PositionsExperience';
import Statistics from './pages/worker/profile/Statistics';
import Documents from './pages/worker/profile/Documents';
import PaymentMethods from './pages/worker/profile/PaymentMethods';
import Legal from './pages/worker/profile/Legal';
import HelpPage from './pages/worker/profile/HelpPage';

// Layouts
import EnterpriseLayout from './components/enterprise/Layout';
import WorkerLayout from './components/worker/Layout';
import ManagerLayout from './components/manager/Layout';
import TestModePanel from './components/common/TestModePanel';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user, token } = useAuthStore();

  if (!token) return <Navigate to="/login" />;
  if (role && user && user.role !== role) return <Navigate to="/" />;

  return <>{children}</>;
}

function App() {
  const { loadUser, token } = useAuthStore();

  useEffect(() => {
    if (token) loadUser();
  }, [token, loadUser]);

  return (
    <>
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Portail Entreprise (consultation passive) */}
        <Route path="/enterprise" element={<ProtectedRoute role="ENTERPRISE"><EnterpriseLayout /></ProtectedRoute>}>
          <Route index element={<EnterpriseDashboard />} />
          <Route path="missions" element={<EnterpriseMissions />} />
          <Route path="contracts" element={<EnterpriseContracts />} />
          <Route path="presence" element={<EnterprisePresence />} />
          <Route path="reports" element={<EnterpriseReports />} />
        </Route>

        {/* Portail Manager (gestionnaire) */}
        <Route path="/manager" element={<ProtectedRoute role="MANAGER"><ManagerLayout /></ProtectedRoute>}>
          <Route index element={<ManagerDashboard />} />
          <Route path="missions" element={<ManagerMissions />} />
          <Route path="missions/create" element={<ManagerCreateMission />} />
          <Route path="workers" element={<ManagerWorkers />} />
          <Route path="workers/:id" element={<ManagerWorkerDetail />} />
          <Route path="time-validation" element={<ManagerTimeValidation />} />
          <Route path="companies" element={<ManagerCompanies />} />
          <Route path="reports" element={<ManagerReports />} />
        </Route>

        {/* Portail Travailleur — Nouveau design quarts */}
        <Route path="/worker" element={<ProtectedRoute role="WORKER"><WorkerLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/worker/shifts" replace />} />
          <Route path="shifts" element={<AvailableShifts />} />
          <Route path="shifts/:id" element={<ShiftDetail />} />
          <Route path="my-shifts" element={<MyShifts />} />
          <Route path="billing" element={<Billing />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<ProfileHub />} />
          <Route path="profile/account" element={<AccountInfo />} />
          <Route path="profile/positions" element={<PositionsExperience />} />
          <Route path="profile/statistics" element={<Statistics />} />
          <Route path="profile/documents" element={<Documents />} />
          <Route path="profile/payment-methods" element={<PaymentMethods />} />
          <Route path="profile/legal" element={<Legal />} />
          <Route path="profile/help" element={<HelpPage />} />
        </Route>
      </Routes>

      {/* Panneau de test persistant */}
      <TestModePanel />
    </>
  );
}

export default App;
