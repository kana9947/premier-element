import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useTestModeStore } from '../../stores/testModeStore';
import { authApi } from '../../services/api';

interface DemoAccount {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  detail: string;
}

// Toutes les routes de l'application
const allRoutes = {
  public: [
    { path: '/', label: 'Accueil', labelEn: 'Home' },
    { path: '/login', label: 'Connexion', labelEn: 'Login' },
    { path: '/register?role=ENTERPRISE', label: 'Inscription Entreprise', labelEn: 'Register Enterprise' },
    { path: '/register?role=WORKER', label: 'Inscription Travailleur', labelEn: 'Register Worker' },
  ],
  enterprise: [
    { path: '/enterprise', label: 'Dashboard', labelEn: 'Dashboard' },
    { path: '/enterprise/missions', label: 'Missions', labelEn: 'Missions' },
    { path: '/enterprise/contracts', label: 'Contrats', labelEn: 'Contracts' },
    { path: '/enterprise/presence', label: 'Présence', labelEn: 'Presence' },
    { path: '/enterprise/reports', label: 'Rapports', labelEn: 'Reports' },
  ],
  manager: [
    { path: '/manager', label: 'Dashboard', labelEn: 'Dashboard' },
    { path: '/manager/missions', label: 'Missions', labelEn: 'Missions' },
    { path: '/manager/missions/create', label: 'Créer Mission', labelEn: 'Create Mission' },
    { path: '/manager/workers', label: 'Travailleurs', labelEn: 'Workers' },
    { path: '/manager/time-validation', label: 'Validation heures', labelEn: 'Time Validation' },
    { path: '/manager/companies', label: 'Entreprises', labelEn: 'Companies' },
    { path: '/manager/reports', label: 'Rapports', labelEn: 'Reports' },
  ],
  worker: [
    { path: '/worker/shifts', label: 'Quarts offerts', labelEn: 'Available Shifts' },
    { path: '/worker/my-shifts', label: 'Mes quarts', labelEn: 'My Shifts' },
    { path: '/worker/billing', label: 'Facturation', labelEn: 'Billing' },
    { path: '/worker/notifications', label: 'Notifications', labelEn: 'Notifications' },
    { path: '/worker/profile', label: 'Profil', labelEn: 'Profile' },
    { path: '/worker/profile/account', label: 'Compte', labelEn: 'Account' },
    { path: '/worker/profile/positions', label: 'Postes', labelEn: 'Positions' },
    { path: '/worker/profile/statistics', label: 'Statistiques', labelEn: 'Statistics' },
    { path: '/worker/profile/payment-methods', label: 'Paiement', labelEn: 'Payment' },
    { path: '/worker/profile/documents', label: 'Documents', labelEn: 'Documents' },
    { path: '/worker/profile/legal', label: 'Légal', labelEn: 'Legal' },
    { path: '/worker/profile/help', label: 'Aide', labelEn: 'Help' },
  ],
};

export default function TestModePanel() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, logout } = useAuthStore();
  const { isTestMode, toggleTestMode } = useTestModeStore();

  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [password, setPassword] = useState('');
  const [switching, setSwitching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'accounts' | 'navigate'>('accounts');

  const isFr = i18n.language === 'fr';

  useEffect(() => {
    authApi
      .demoAccounts()
      .then((data) => {
        setAccounts(data.accounts);
        setPassword(data.password);
      })
      .catch(console.error);
  }, []);

  const switchAccount = async (email: string) => {
    setSwitching(true);
    logout();
    await login(email, password);
    const { user: newUser } = useAuthStore.getState();
    if (newUser) {
      const dest = newUser.role === 'ENTERPRISE' ? '/enterprise' : newUser.role === 'MANAGER' ? '/manager' : '/worker';
      navigate(dest);
    }
    setSwitching(false);
  };

  const navigateTo = (path: string) => {
    // Pour les routes protégées, vérifier qu'on est connecté avec le bon rôle
    if (path.startsWith('/enterprise') && (!user || user.role !== 'ENTERPRISE')) {
      // Se connecter auto au premier compte entreprise
      const enterpriseAccount = accounts.find((a) => a.role === 'ENTERPRISE');
      if (enterpriseAccount) {
        setSwitching(true);
        logout();
        login(enterpriseAccount.email, password).then(() => {
          navigate(path);
          setSwitching(false);
        });
        return;
      }
    }
    if (path.startsWith('/manager') && (!user || user.role !== 'MANAGER')) {
      const managerAccount = accounts.find((a) => a.role === 'MANAGER');
      if (managerAccount) {
        setSwitching(true);
        logout();
        login(managerAccount.email, password).then(() => {
          navigate(path);
          setSwitching(false);
        });
        return;
      }
    }
    if (path.startsWith('/worker') && (!user || user.role !== 'WORKER')) {
      const workerAccount = accounts.find((a) => a.role === 'WORKER');
      if (workerAccount) {
        setSwitching(true);
        logout();
        login(workerAccount.email, password).then(() => {
          navigate(path);
          setSwitching(false);
        });
        return;
      }
    }
    navigate(path);
  };

  const enterprises = accounts.filter((a) => a.role === 'ENTERPRISE');
  const managers = accounts.filter((a) => a.role === 'MANAGER');
  const workers = accounts.filter((a) => a.role === 'WORKER');

  // Bouton flottant quand le panneau est fermé
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {/* Indicateur mode test actif */}
        {isTestMode && (
          <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
            MODE TEST ACTIF
          </span>
        )}
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110"
          title="Mode Test"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-gray-900 text-white shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-orange-400">MODE TEST</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Toggle Test Mode */}
        <button
          onClick={toggleTestMode}
          className={`w-full py-2 rounded-lg font-semibold text-sm transition-colors ${
            isTestMode
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {isTestMode
            ? (isFr ? 'Mode Test : ACTIF (auto-remplissage ON)' : 'Test Mode: ACTIVE (auto-fill ON)')
            : (isFr ? 'Mode Test : INACTIF' : 'Test Mode: INACTIVE')
          }
        </button>

        {/* Utilisateur actuel */}
        {user && (
          <div className="mt-2 px-3 py-2 bg-gray-700 rounded-lg text-xs">
            <span className="text-gray-400">{isFr ? 'Connecté :' : 'Logged in:'}</span>{' '}
            <span className="font-semibold">{user.firstName} {user.lastName}</span>{' '}
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              user.role === 'ENTERPRISE' ? 'bg-purple-600' : user.role === 'MANAGER' ? 'bg-amber-600' : 'bg-green-600'
            }`}>
              {user.role}
            </span>
          </div>
        )}

        {switching && (
          <p className="mt-2 text-xs text-orange-300 animate-pulse text-center">{t('common.loading')}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'accounts'
              ? 'text-orange-400 border-b-2 border-orange-400 bg-gray-800'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {isFr ? 'Comptes' : 'Accounts'}
        </button>
        <button
          onClick={() => setActiveTab('navigate')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'navigate'
              ? 'text-orange-400 border-b-2 border-orange-400 bg-gray-800'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {isFr ? 'Navigation' : 'Navigate'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'accounts' ? (
          <div className="space-y-4">
            {/* Entreprises */}
            <div>
              <p className="text-xs font-semibold text-purple-400 mb-2 uppercase tracking-wide">
                {isFr ? 'Entreprises' : 'Enterprises'}
              </p>
              <div className="space-y-1.5">
                {enterprises.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => switchAccount(acc.email)}
                    disabled={switching}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                      user?.email === acc.email
                        ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                    } disabled:opacity-50`}
                  >
                    <div className="font-medium">{acc.firstName} {acc.lastName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{acc.detail || acc.email}</div>
                    {user?.email === acc.email && (
                      <span className="inline-block mt-1 text-[10px] bg-purple-500 px-2 py-0.5 rounded font-bold">
                        {isFr ? 'ACTIF' : 'ACTIVE'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Gestionnaires */}
            <div>
              <p className="text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wide">
                {isFr ? 'Gestionnaires' : 'Managers'}
              </p>
              <div className="space-y-1.5">
                {managers.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => switchAccount(acc.email)}
                    disabled={switching}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                      user?.email === acc.email
                        ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                    } disabled:opacity-50`}
                  >
                    <div className="font-medium">{acc.firstName} {acc.lastName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{acc.detail || acc.email}</div>
                    {user?.email === acc.email && (
                      <span className="inline-block mt-1 text-[10px] bg-amber-500 px-2 py-0.5 rounded font-bold">
                        {isFr ? 'ACTIF' : 'ACTIVE'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Travailleurs */}
            <div>
              <p className="text-xs font-semibold text-green-400 mb-2 uppercase tracking-wide">
                {isFr ? 'Travailleurs' : 'Workers'}
              </p>
              <div className="space-y-1.5">
                {workers.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => switchAccount(acc.email)}
                    disabled={switching}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                      user?.email === acc.email
                        ? 'bg-green-600 text-white ring-2 ring-green-400'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                    } disabled:opacity-50`}
                  >
                    <div className="font-medium">{acc.firstName} {acc.lastName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{acc.detail || acc.email}</div>
                    {user?.email === acc.email && (
                      <span className="inline-block mt-1 text-[10px] bg-green-500 px-2 py-0.5 rounded font-bold">
                        {isFr ? 'ACTIF' : 'ACTIVE'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Déconnexion */}
            {user && (
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="w-full py-2 mt-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {t('common.logout')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pages publiques */}
            <div>
              <p className="text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wide">
                {isFr ? 'Pages publiques' : 'Public Pages'}
              </p>
              <div className="space-y-1">
                {allRoutes.public.map((route) => (
                  <button
                    key={route.path}
                    onClick={() => navigateTo(route.path)}
                    disabled={switching}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      location.pathname + location.search === route.path
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                    } disabled:opacity-50`}
                  >
                    {isFr ? route.label : route.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Pages Entreprise */}
            <div>
              <p className="text-xs font-semibold text-purple-400 mb-2 uppercase tracking-wide">
                {isFr ? 'Portail Entreprise' : 'Enterprise Portal'}
              </p>
              <div className="space-y-1">
                {allRoutes.enterprise.map((route) => (
                  <button
                    key={route.path}
                    onClick={() => navigateTo(route.path)}
                    disabled={switching}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      location.pathname === route.path
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                    } disabled:opacity-50`}
                  >
                    {isFr ? route.label : route.labelEn}
                    {user?.role !== 'ENTERPRISE' && (
                      <span className="ml-2 text-[10px] text-gray-500">{isFr ? '(connexion auto)' : '(auto-login)'}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Pages Gestionnaire */}
            <div>
              <p className="text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wide">
                {isFr ? 'Portail Gestionnaire' : 'Manager Portal'}
              </p>
              <div className="space-y-1">
                {allRoutes.manager.map((route) => (
                  <button
                    key={route.path}
                    onClick={() => navigateTo(route.path)}
                    disabled={switching}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      location.pathname === route.path
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                    } disabled:opacity-50`}
                  >
                    {isFr ? route.label : route.labelEn}
                    {user?.role !== 'MANAGER' && (
                      <span className="ml-2 text-[10px] text-gray-500">{isFr ? '(connexion auto)' : '(auto-login)'}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Pages Travailleur */}
            <div>
              <p className="text-xs font-semibold text-green-400 mb-2 uppercase tracking-wide">
                {isFr ? 'Portail Travailleur' : 'Worker Portal'}
              </p>
              <div className="space-y-1">
                {allRoutes.worker.map((route) => (
                  <button
                    key={route.path}
                    onClick={() => navigateTo(route.path)}
                    disabled={switching}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      location.pathname === route.path
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                    } disabled:opacity-50`}
                  >
                    {isFr ? route.label : route.labelEn}
                    {user?.role !== 'WORKER' && (
                      <span className="ml-2 text-[10px] text-gray-500">{isFr ? '(connexion auto)' : '(auto-login)'}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-800 border-t border-gray-700 text-center text-[10px] text-gray-500">
        {isFr ? 'Panneau de test - Ne pas utiliser en production' : 'Test panel - Do not use in production'}
      </div>
    </div>
  );
}
