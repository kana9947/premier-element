import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { companiesApi } from '../../services/api';

interface PunchData {
  id: string;
  type: string;
  timestamp: string;
  isWithinZone: boolean;
  mission: { title: string };
  worker: { user: { firstName: string; lastName: string; avatarUrl: string | null } };
}

export default function EnterprisePresence() {
  const { t } = useTranslation();
  const [punches, setPunches] = useState<PunchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companiesApi.presence()
      .then((data) => setPunches((data as { punches: PunchData[] }).punches))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('enterprise.presence')}</h1>

      {punches.length === 0 ? (
        <p className="text-gray-400 text-center py-8">{t('enterprise.noPresence')}</p>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">{t('manager.worker')}</th>
                <th className="text-left px-4 py-3 font-medium">Mission</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">{t('enterprise.dateTime')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('timepunch.zone')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {punches.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.worker.user.avatarUrl ? (
                        <img src={p.worker.user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700">
                          {p.worker.user.firstName[0]}{p.worker.user.lastName[0]}
                        </div>
                      )}
                      <span>{p.worker.user.firstName} {p.worker.user.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.mission.title}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.type === 'PUNCH_IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {p.type === 'PUNCH_IN' ? t('timepunch.punchIn') : t('timepunch.punchOut')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(p.timestamp).toLocaleString('fr-CA')}</td>
                  <td className="px-4 py-3">
                    {p.isWithinZone
                      ? <span className="text-green-600">{t('timepunch.inZone')}</span>
                      : <span className="text-red-600">{t('timepunch.outOfZone')}</span>
                    }
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
