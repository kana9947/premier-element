import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Documents() {
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

      <h1 className="text-xl font-bold text-gray-900 mb-4">{t('profileMenu.documents')}</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <span className="text-5xl mb-4 block">📄</span>
        <p className="text-gray-500">Aucun document pour le moment.</p>
        <p className="text-sm text-gray-400 mt-2">
          Vos documents importants apparaîtront ici.
        </p>
      </div>
    </div>
  );
}
