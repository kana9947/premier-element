import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';

const menuItems = [
  { key: 'accountInfo', path: '/worker/profile/account', icon: '👤' },
  { key: 'positions', path: '/worker/profile/positions', icon: '🛠' },
  { key: 'statistics', path: '/worker/profile/statistics', icon: '📊' },
  { key: 'documents', path: '/worker/profile/documents', icon: '📄' },
  { key: 'paymentMethods', path: '/worker/profile/payment-methods', icon: '💳' },
  { key: 'legal', path: '/worker/profile/legal', icon: '⚖️' },
  { key: 'help', path: '/worker/profile/help', icon: '❓' },
];

export default function ProfileHub() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      {/* User header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4 text-center">
        <div className="w-20 h-20 bg-worker-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl text-worker-600">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </span>
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          {user?.firstName} {user?.lastName}
        </h2>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>

      {/* Menu items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {menuItems.map((item, index) => (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors text-left ${
              index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <span className="text-xl w-8 text-center">{item.icon}</span>
            <span className="flex-1 text-sm font-medium text-gray-700">
              {t(`profileMenu.${item.key}`)}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {/* App version */}
      <p className="text-center text-xs text-gray-400 mt-6">
        {t('profileMenu.appVersion')}: 1.0.0
      </p>
    </div>
  );
}
