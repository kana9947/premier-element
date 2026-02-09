import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useEffect } from 'react';

export default function WorkerLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { unreadCount, loadUnreadCount } = useNotificationStore();

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            {/* Left: App name */}
            <NavLink to="/worker" className="text-lg font-bold text-worker-600">
              WorkerApp
            </NavLink>

            {/* Right: bell, language, user, logout */}
            <div className="flex items-center gap-3">
              {/* Notification bell */}
              <NavLink to="/worker/notifications" className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
                    {unreadCount}
                  </span>
                )}
              </NavLink>

              <LanguageSwitcher />

              <span className="text-sm text-gray-600 hidden sm:inline">
                {user?.firstName}
              </span>

              <button
                onClick={handleLogout}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pb-24">
        <Outlet />
      </main>

      {/* Fixed bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-2">
          {/* Tab 1: Shifts */}
          <NavLink
            to="/worker/shifts"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-worker-600' : 'text-gray-400'
              }`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Quarts</span>
          </NavLink>

          {/* Tab 2: My Shifts */}
          <NavLink
            to="/worker/my-shifts"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-worker-600' : 'text-gray-400'
              }`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <span>Mes quarts</span>
          </NavLink>

          {/* Tab 3: Billing */}
          <NavLink
            to="/worker/billing"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-worker-600' : 'text-gray-400'
              }`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Facturation</span>
          </NavLink>

          {/* Tab 4: Profile */}
          <NavLink
            to="/worker/profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-worker-600' : 'text-gray-400'
              }`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Profil</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
