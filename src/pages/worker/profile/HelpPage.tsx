import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const faqItems = [
  {
    question: 'Comment postuler à un quart ?',
    answer: 'Allez dans "Quarts offerts", sélectionnez un quart qui vous intéresse, puis cliquez sur "Postuler".',
  },
  {
    question: 'Comment déclarer mes heures ?',
    answer: 'Rendez-vous dans "Facturation", onglet "À déclarer", puis cliquez sur "Déclarer mes heures" pour chaque quart.',
  },
  {
    question: 'Comment modifier mes informations bancaires ?',
    answer: 'Allez dans Profil > Modes de paiement pour mettre à jour vos coordonnées bancaires.',
  },
  {
    question: 'Comment signaler un retard ?',
    answer: 'Ouvrez le détail du quart concerné et utilisez le bouton "Signaler un retard".',
  },
  {
    question: 'Comment annuler un quart ?',
    answer: 'Ouvrez le détail du quart et utilisez "Annuler ce quart". Une raison est optionnelle.',
  },
];

export default function HelpPage() {
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

      <h1 className="text-xl font-bold text-gray-900 mb-4">{t('profileMenu.help')}</h1>

      {/* FAQ */}
      <div className="space-y-3">
        {faqItems.map((item, i) => (
          <details
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group"
          >
            <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-800 hover:bg-gray-50 list-none flex items-center justify-between">
              {item.question}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400 group-open:rotate-180 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-4 pb-3 text-sm text-gray-500">
              {item.answer}
            </div>
          </details>
        ))}
      </div>

      {/* Contact support */}
      <div className="bg-worker-50 rounded-xl p-4 mt-6 text-center">
        <p className="text-sm text-worker-700 font-medium mb-2">
          Besoin d'aide supplémentaire ?
        </p>
        <a
          href="mailto:support@workerapp.ca"
          className="inline-block px-4 py-2 bg-worker-600 text-white text-sm font-medium rounded-lg hover:bg-worker-700 transition-colors"
        >
          Contacter le support
        </a>
      </div>
    </div>
  );
}
