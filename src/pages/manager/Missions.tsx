import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { managerApi } from '../../services/api';

interface MissionApp {
  id: string;
  status: string;
  worker: { user: { firstName: string; lastName: string; avatarUrl?: string | null } };
}

interface MissionData {
  id: string;
  title: string;
  city: string;
  startDate: string;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  status: string;
  postType?: string;
  isUrgent: boolean;
  company: { companyName: string };
  applications: MissionApp[];
  contracts: { id: string; status: string; worker: { user: { firstName: string; lastName: string } } }[];
}

export default function ManagerMissions() {
  const { t } = useTranslation();
  const [missions, setMissions] = useState<MissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processing, setProcessing] = useState('');

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = () => {
    managerApi.missions()
      .then((data) => setMissions(data.missions as MissionData[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handlePublish = async (id: string) => {
    setProcessing(id);
    try {
      await managerApi.publishMission(id);
      loadMissions();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setProcessing('');
    }
  };

  const handleAccept = async (appId: string) => {
    setProcessing(appId);
    try {
      await managerApi.acceptApplication(appId);
      loadMissions();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setProcessing('');
    }
  };

  const handleReject = async (appId: string) => {
    setProcessing(appId);
    try {
      await managerApi.rejectApplication(appId);
      loadMissions();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setProcessing('');
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-600',
      PUBLISHED: 'bg-green-100 text-green-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-purple-100 text-purple-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return `px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`;
  };

  if (loading) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('manager.missions')}</h1>

      {missions.length === 0 ? (
        <p className="text-gray-400 text-center py-8">{t('manager.noMissions')}</p>
      ) : (
        <div className="space-y-3">
          {missions.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                className="w-full text-left px-4 py-3 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{m.title}</span>
                    <span className={statusBadge(m.status)}>{m.status}</span>
                    {m.isUrgent && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium">URGENT</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {m.company.companyName} — {m.city} — {new Date(m.startDate).toLocaleDateString('fr-CA')} — {m.hourlyRate}$/h
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {m.applications.filter((a) => a.status === 'PENDING').length > 0 && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                      {m.applications.filter((a) => a.status === 'PENDING').length} {t('manager.pending')}
                    </span>
                  )}
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === m.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>

              {expandedId === m.id && (
                <div className="px-4 pb-4 border-t border-gray-50">
                  {m.status === 'DRAFT' && (
                    <button
                      onClick={() => handlePublish(m.id)}
                      disabled={processing === m.id}
                      className="mt-3 px-4 py-1.5 bg-manager-600 text-white rounded-lg text-sm font-medium hover:bg-manager-700 disabled:opacity-50"
                    >
                      {t('manager.publish')}
                    </button>
                  )}

                  {m.applications.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">{t('manager.applications')}</p>
                      <div className="space-y-2">
                        {m.applications.map((app) => (
                          <div key={app.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              {app.worker.user.avatarUrl ? (
                                <img src={app.worker.user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700">
                                  {app.worker.user.firstName[0]}{app.worker.user.lastName[0]}
                                </div>
                              )}
                              <span className="text-sm font-medium">{app.worker.user.firstName} {app.worker.user.lastName}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                app.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                              }`}>{app.status}</span>
                            </div>
                            {app.status === 'PENDING' && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleAccept(app.id)}
                                  disabled={!!processing}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium disabled:opacity-50"
                                >
                                  {t('manager.accept')}
                                </button>
                                <button
                                  onClick={() => handleReject(app.id)}
                                  disabled={!!processing}
                                  className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium disabled:opacity-50"
                                >
                                  {t('manager.reject')}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {m.contracts.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">{t('manager.assignedWorkers')}</p>
                      <div className="space-y-1">
                        {m.contracts.map((c) => (
                          <div key={c.id} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-2 h-2 rounded-full bg-green-400" />
                            {c.worker.user.firstName} {c.worker.user.lastName}
                            <span className="text-xs text-gray-400">({c.status})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
