import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import LanguageSwitcher from '../common/LanguageSwitcher';

export default function EnterpriseLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-enterprise-600 text-white'
        : 'text-gray-600 hover:bg-enterprise-50 hover:text-enterprise-700'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-enterprise-600">{t('common.appName')}</span>
              <span className="text-xs bg-enterprise-100 text-enterprise-700 px-2 py-0.5 rounded-full">
                {t('auth.enterprise')}
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
          <div className="flex gap-2 py-3">
            <NavLink to="/enterprise" end className={linkClass}>
              {t('common.dashboard')}
            </NavLink>
            <NavLink to="/enterprise/missions" className={linkClass}>
              {t('enterprise.missions')}
            </NavLink>
            <NavLink to="/enterprise/contracts" className={linkClass}>
              {t('enterprise.contracts')}
            </NavLink>
            <NavLink to="/enterprise/presence" className={linkClass}>
              {t('enterprise.presence')}
            </NavLink>
            <NavLink to="/enterprise/reports" className={linkClass}>
              {t('enterprise.reports')}
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
