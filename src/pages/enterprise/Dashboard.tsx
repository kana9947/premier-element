import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { companiesApi } from '../../services/api';

export default function EnterpriseDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companiesApi.dashboard()
      .then((data) => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">{t('common.loading')}</p>;

  const cards = [
    { label: t('enterprise.activeMissions'), value: stats.activeMissions || 0, color: 'bg-blue-500', link: '/enterprise/missions' },
    { label: t('enterprise.totalContracts'), value: stats.totalContracts || 0, color: 'bg-green-500', link: '/enterprise/contracts' },
    { label: t('enterprise.presence'), value: '', color: 'bg-amber-500', link: '/enterprise/presence' },
    { label: t('enterprise.reports'), value: '', color: 'bg-purple-500', link: '/enterprise/reports' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('enterprise.dashboard')}</h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link key={card.label} to={card.link} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
              <span className="text-white text-xl font-bold">{card.value}</span>
            </div>
            <p className="text-gray-600 font-medium">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
