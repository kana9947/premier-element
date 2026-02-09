import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { missionsApi } from '../../services/api';

interface Mission {
  id: string;
  title: string;
  serviceType: string;
  city: string;
  hourlyRate: number;
  status: string;
  startDate: string;
  applications: { id: string; status: string; worker: { user: { firstName: string; lastName: string } } }[];
}

export default function EnterpriseMissions() {
  const { t } = useTranslation();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    missionsApi.myMissions()
      .then((data) => setMissions(data.missions as Mission[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const serviceLabel = (type: string) => {
    const labels: Record<string, string> = {
      MENAGE_DOMICILE: t('mission.menageDomicile'),
      MENAGE_ENTREPRISE: t('mission.menageEntreprise'),
      DEMENAGEMENT: t('mission.demenagement'),
    };
    return labels[type] || type;
  };

  const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: t('mission.status.draft'),
      PUBLISHED: t('mission.status.published'),
      IN_PROGRESS: t('mission.status.inProgress'),
      COMPLETED: t('mission.status.completed'),
      CANCELLED: t('mission.status.cancelled'),
    };
    return labels[status] || status;
  };

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-700',
      PUBLISHED: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const appStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700',
      ACCEPTED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      WITHDRAWN: 'bg-gray-100 text-gray-500',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  if (loading) return <p className="text-gray-500">{t('common.loading')}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('enterprise.missions')}</h1>

      {missions.length === 0 ? (
        <p className="text-gray-500 text-center py-12">{t('common.noResults')}</p>
      ) : (
        <div className="space-y-4">
          {missions.map((mission) => (
            <div key={mission.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{mission.title}</h3>
                  <p className="text-sm text-gray-500">
                    {serviceLabel(mission.serviceType)} - {mission.city} - {mission.hourlyRate}$/h
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(mission.status)}`}>
                  {statusLabel(mission.status)}
                </span>
              </div>

              {mission.applications.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {t('mission.applications')} ({mission.applications.length})
                  </h4>
                  <div className="space-y-2">
                    {mission.applications.map((app) => (
                      <div key={app.id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                        <span className="text-sm font-medium">
                          {app.worker.user.firstName} {app.worker.user.lastName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${appStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
