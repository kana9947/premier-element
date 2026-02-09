import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Legal() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
      <button
        onClick={() => navigate('/worker/profile')}
        className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700"
      >
        ← {t('common.back')}
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-4">{t('profileMenu.legal')}</h1>

      {/* Worker Contract */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">📋</span>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800">{t('profileMenu.workerContract')}</h3>
            <p className="text-xs text-gray-400">Dernière mise à jour: 2026-01-15</p>
          </div>
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
        </div>
      </div>

      {/* Privacy Policy */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔒</span>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800">{t('profileMenu.privacyPolicy')}</h3>
            <p className="text-xs text-gray-400">Dernière mise à jour: 2026-01-15</p>
          </div>
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
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">
        En utilisant cette application, vous acceptez nos conditions d'utilisation.
      </p>
    </div>
  );
}
