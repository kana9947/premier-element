import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { missionsApi } from '../../services/api';

interface Mission {
  id: string;
  title: string;
  description: string;
  serviceType: string;
  city: string;
  postalCode: string;
  hourlyRate: number;
  startDate: string;
  startTime: string;
  endTime: string;
  requiredWorkers: number;
  company: { companyName: string; user: { firstName: string; lastName: string } };
}

export default function FindMissions() {
  const { t } = useTranslation();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ serviceType: '', city: '' });
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const loadMissions = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filters.serviceType) params.serviceType = filters.serviceType;
    if (filters.city) params.city = filters.city;

    missionsApi.list(params)
      .then((data) => setMissions(data.missions as Mission[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMissions(); }, []);

  const handleApply = async (missionId: string) => {
    setApplyingId(missionId);
    try {
      await missionsApi.apply(missionId);
      alert(t('missions.applicationSent'));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setApplyingId(null);
    }
  };

  const serviceLabel = (type: string) => {
    const labels: Record<string, string> = {
      MENAGE_DOMICILE: t('mission.menageDomicile'),
      MENAGE_ENTREPRISE: t('mission.menageEntreprise'),
      DEMENAGEMENT: t('mission.demenagement'),
    };
    return labels[type] || type;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('worker.findMissions')}</h1>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4">
        <select
          value={filters.serviceType}
          onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">{t('mission.serviceType')} - Tous</option>
          <option value="MENAGE_DOMICILE">{t('mission.menageDomicile')}</option>
          <option value="MENAGE_ENTREPRISE">{t('mission.menageEntreprise')}</option>
          <option value="DEMENAGEMENT">{t('mission.demenagement')}</option>
        </select>
        <input
          type="text"
          placeholder={t('auth.city')}
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <button
          onClick={loadMissions}
          className="px-4 py-2 bg-worker-600 text-white text-sm rounded-lg hover:bg-worker-700 transition-colors"
        >
          {t('common.search')}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">{t('common.loading')}</p>
      ) : missions.length === 0 ? (
        <p className="text-gray-500 text-center py-12">{t('common.noResults')}</p>
      ) : (
        <div className="space-y-4">
          {missions.map((mission) => (
            <div key={mission.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{mission.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {mission.company.companyName || `${mission.company.user.firstName} ${mission.company.user.lastName}`}
                  </p>
                  <p className="text-gray-600 text-sm mb-3">{mission.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">{serviceLabel(mission.serviceType)}</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">{mission.city} {mission.postalCode}</span>
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded">{mission.hourlyRate}$/h</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">{mission.startTime} - {mission.endTime}</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {new Date(mission.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleApply(mission.id)}
                  disabled={applyingId === mission.id}
                  className="ml-4 px-6 py-2 bg-worker-600 text-white font-medium rounded-lg hover:bg-worker-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {applyingId === mission.id ? t('common.loading') : t('worker.apply')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
