import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { managerApi } from '../../services/api';

interface Declaration {
  id: string;
  date: string;
  plannedHours: number;
  actualHours: number | null;
  hourlyRate: number;
  estimatedAmount: number;
  status: string;
  note: string | null;
  mission: { title: string; company: { companyName: string } };
  worker: { user: { firstName: string; lastName: string; avatarUrl: string | null } };
}

export default function TimeValidation() {
  const { t } = useTranslation();
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState('');

  useEffect(() => {
    loadDeclarations();
  }, []);

  const loadDeclarations = () => {
    managerApi.timeDeclarations()
      .then((data) => setDeclarations(data.declarations as Declaration[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      await managerApi.approveDeclaration(id);
      setDeclarations((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setProcessing('');
    }
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    try {
      await managerApi.rejectDeclaration(id);
      setDeclarations((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setProcessing('');
    }
  };

  if (loading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('manager.timeValidation')}</h1>

      {declarations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">{t('manager.noDeclarations')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {declarations.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {d.worker.user.avatarUrl ? (
                    <img src={d.worker.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-700">
                      {d.worker.user.firstName[0]}{d.worker.user.lastName[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{d.worker.user.firstName} {d.worker.user.lastName}</p>
                    <p className="text-sm text-gray-500">{d.mission.title} — {d.mission.company.companyName}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">{new Date(d.date).toLocaleDateString('fr-CA')}</p>
                  <p className="font-bold text-gray-900">{d.actualHours?.toFixed(1) || '—'}h / {d.plannedHours}h</p>
                  <p className="text-sm text-manager-600 font-medium">{d.estimatedAmount.toFixed(2)} $</p>
                </div>
              </div>

              {d.note && <p className="mt-2 text-sm text-gray-500 italic">"{d.note}"</p>}

              <div className="flex gap-2 mt-3 justify-end">
                <button
                  onClick={() => handleApprove(d.id)}
                  disabled={!!processing}
                  className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {t('manager.approve')}
                </button>
                <button
                  onClick={() => handleReject(d.id)}
                  disabled={!!processing}
                  className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {t('manager.reject')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
