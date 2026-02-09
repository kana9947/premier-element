import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../services/api';

export default function ManagerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    managerApi.dashboard()
      .then((data) => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: t('manager.statCompanies'), value: stats.companies || 0, color: 'bg-purple-100 text-purple-700', link: '/manager/companies' },
    { label: t('manager.statWorkers'), value: stats.workers || 0, color: 'bg-green-100 text-green-700', link: '/manager/workers' },
    { label: t('manager.statMissions'), value: stats.missions || 0, color: 'bg-blue-100 text-blue-700', link: '/manager/missions' },
    { label: t('manager.statPendingApplications'), value: stats.pendingApplications || 0, color: 'bg-amber-100 text-amber-700', link: '/manager/missions' },
    { label: t('manager.statPendingDeclarations'), value: stats.pendingDeclarations || 0, color: 'bg-red-100 text-red-700', link: '/manager/time-validation' },
    { label: t('manager.statReports'), value: stats.totalReports || 0, color: 'bg-gray-100 text-gray-700', link: '/manager/reports' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('common.dashboard')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => navigate(card.link)}
            className={`${card.color} rounded-xl p-4 text-left hover:shadow-md transition-shadow`}
          >
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-sm font-medium mt-1">{card.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
