import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { workersApi } from '../../services/api';

interface Application {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  mission: {
    title: string;
    serviceType: string;
    city: string;
    hourlyRate: number;
    company: { user: { firstName: string; lastName: string } };
  };
}

export default function WorkerApplications() {
  const { t } = useTranslation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workersApi.applications()
      .then((data) => setApplications(data.applications as Application[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      ACCEPTED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      WITHDRAWN: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) return <p className="text-gray-500">{t('common.loading')}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('worker.myApplications')}</h1>

      {applications.length === 0 ? (
        <p className="text-gray-500 text-center py-12">{t('common.noResults')}</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{app.mission.title}</h3>
                  <p className="text-sm text-gray-500">
                    {app.mission.company.user.firstName} {app.mission.company.user.lastName} - {app.mission.city}
                  </p>
                  <p className="text-sm text-gray-500">{app.mission.hourlyRate}$/h</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(app.status)}`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
