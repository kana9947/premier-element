import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { workersApi } from '../../../services/api';

interface ProfileData {
  rating: number;
  totalMissions: number;
  hourlyRate: number | null;
}

export default function Statistics() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      workersApi.profile(),
      workersApi.payments(),
    ])
      .then(([profileData, paymentsData]) => {
        setProfile(profileData.profile as ProfileData);
        setTotalEarned(paymentsData.summary.totalEarned);
        setTotalPending(paymentsData.summary.totalPending);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Note moyenne',
      value: profile?.rating ? `${profile.rating}/5` : '—',
      icon: '⭐',
      color: 'bg-yellow-50 text-yellow-700',
    },
    {
      label: 'Missions complétées',
      value: profile?.totalMissions || 0,
      icon: '✅',
      color: 'bg-green-50 text-green-700',
    },
    {
      label: t('worker.totalEarned'),
      value: `${totalEarned.toFixed(2)}$`,
      icon: '💰',
      color: 'bg-worker-50 text-worker-700',
    },
    {
      label: t('worker.pendingPayments'),
      value: `${totalPending.toFixed(2)}$`,
      icon: '⏳',
      color: 'bg-orange-50 text-orange-700',
    },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
      <button
        onClick={() => navigate('/worker/profile')}
        className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700"
      >
        ← {t('common.back')}
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-4">{t('profileMenu.statistics')}</h1>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl p-4 ${stat.color}`}
          >
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
            <p className="text-sm mt-1 opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
