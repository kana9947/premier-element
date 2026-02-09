import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { workersApi } from '../../services/api';

interface Payment {
  id: string;
  amount: number;
  hours: number;
  periodStart: string;
  periodEnd: string;
  status: string;
  paidAt: string | null;
  contract: { mission: { title: string } };
}

export default function WorkerPayments() {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState({ totalEarned: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workersApi.payments()
      .then((data) => {
        setPayments(data.payments as Payment[]);
        setSummary(data.summary);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) return <p className="text-gray-500">{t('common.loading')}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('worker.myPayments')}</h1>

      {/* Résumé */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">{t('worker.totalEarned')}</p>
          <p className="text-3xl font-bold text-green-600">${summary.totalEarned.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">{t('worker.pendingPayments')}</p>
          <p className="text-3xl font-bold text-yellow-600">${summary.totalPending.toFixed(2)}</p>
        </div>
      </div>

      {/* Liste */}
      {payments.length === 0 ? (
        <p className="text-gray-500 text-center py-12">{t('common.noResults')}</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heures</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.contract.mission.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.hours}h</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${payment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(payment.periodStart).toLocaleDateString()} - {new Date(payment.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
