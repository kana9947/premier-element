import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../services/api';

interface WorkerData {
  id: string;
  skills: string[];
  serviceTypes: string[];
  hourlyRate: number | null;
  isAvailable: boolean;
  rating: number;
  totalMissions: number;
  user: { id: string; firstName: string; lastName: string; email: string; phone: string | null; avatarUrl: string | null };
}

export default function ManagerWorkers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    managerApi.workers()
      .then((data) => setWorkers(data.workers as WorkerData[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('manager.workers')}</h1>

      {workers.length === 0 ? (
        <p className="text-gray-400 text-center py-8">{t('manager.noWorkers')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map((w) => (
            <button
              key={w.id}
              onClick={() => navigate(`/manager/workers/${w.id}`)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                {w.user.avatarUrl ? (
                  <img src={w.user.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                    {w.user.firstName[0]}{w.user.lastName[0]}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{w.user.firstName} {w.user.lastName}</p>
                  <p className="text-xs text-gray-500">{w.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${w.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {w.isAvailable ? t('manager.available') : t('manager.unavailable')}
                </span>
                {w.hourlyRate && <span className="text-xs text-gray-500">{w.hourlyRate}$/h</span>}
                {w.rating > 0 && <span className="text-xs text-amber-600">{w.rating.toFixed(1)}/5</span>}
                <span className="text-xs text-gray-400">{w.totalMissions} missions</span>
              </div>

              {w.skills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {w.skills.slice(0, 3).map((s) => (
                    <span key={s} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px]">{s}</span>
                  ))}
                  {w.skills.length > 3 && <span className="text-[10px] text-gray-400">+{w.skills.length - 3}</span>}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
