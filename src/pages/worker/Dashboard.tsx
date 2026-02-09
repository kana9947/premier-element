import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { workersApi } from '../../services/api';

export default function WorkerDashboard() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [paymentSummary, setPaymentSummary] = useState({ totalEarned: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      workersApi.profile(),
      workersApi.payments(),
    ])
      .then(([profileData, paymentsData]) => {
        setProfile(profileData.profile as Record<string, unknown>);
        setPaymentSummary(paymentsData.summary);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">{t('common.loading')}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('worker.dashboard')}</h1>

      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white text-lg font-bold">$</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${paymentSummary.totalEarned.toFixed(2)}</p>
          <p className="text-gray-600 text-sm">{t('worker.totalEarned')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white text-lg font-bold">$</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${paymentSummary.totalPending.toFixed(2)}</p>
          <p className="text-gray-600 text-sm">{t('worker.pendingPayments')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className={`w-12 h-12 ${profile?.isAvailable ? 'bg-green-500' : 'bg-red-500'} rounded-lg flex items-center justify-center mb-4`}>
            <span className="text-white text-lg font-bold">{profile?.isAvailable ? 'ON' : 'OFF'}</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {profile?.isAvailable ? t('worker.available') : t('worker.unavailable')}
          </p>
          <p className="text-gray-600 text-sm">{t('worker.availability')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          to="/worker/missions"
          className="px-6 py-3 bg-worker-600 text-white font-medium rounded-lg hover:bg-worker-700 transition-colors"
        >
          {t('worker.findMissions')}
        </Link>
        <Link
          to="/worker/profile"
          className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
        >
          {t('worker.myProfile')}
        </Link>
      </div>
    </div>
  );
}
