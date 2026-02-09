import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import LanguageSwitcher from '../common/LanguageSwitcher';

export default function ManagerLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-manager-600 text-white'
        : 'text-gray-600 hover:bg-manager-50 hover:text-manager-700'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-manager-600">{t('common.appName')}</span>
              <span className="text-xs bg-manager-100 text-manager-700 px-2 py-0.5 rounded-full">
                {t('manager.title')}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-3 overflow-x-auto">
            <NavLink to="/manager" end className={linkClass}>
              {t('common.dashboard')}
            </NavLink>
            <NavLink to="/manager/missions" className={linkClass}>
              {t('manager.missions')}
            </NavLink>
            <NavLink to="/manager/missions/create" className={linkClass}>
              {t('manager.createMission')}
            </NavLink>
            <NavLink to="/manager/workers" className={linkClass}>
              {t('manager.workers')}
            </NavLink>
            <NavLink to="/manager/time-validation" className={linkClass}>
              {t('manager.timeValidation')}
            </NavLink>
            <NavLink to="/manager/companies" className={linkClass}>
              {t('manager.companies')}
            </NavLink>
            <NavLink to="/manager/reports" className={linkClass}>
              {t('manager.reports')}
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
