import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { managerApi } from '../../services/api';

interface WorkerDetailData {
  id: string;
  bio: string | null;
  address: string | null;
  city: string | null;
  skills: string[];
  serviceTypes: string[];
  hourlyRate: number | null;
  isAvailable: boolean;
  rating: number;
  totalMissions: number;
  experienceYears: number;
  transportMode: string | null;
  workPreference: string | null;
  user: { id: string; firstName: string; lastName: string; email: string; phone: string | null; avatarUrl: string | null };
  contracts: { id: string; status: string; hourlyRate: number; mission: { title: string; startDate: string; company: { companyName: string } } }[];
  timePunches: { id: string; type: string; timestamp: string; isWithinZone: boolean }[];
}

export default function WorkerDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [worker, setWorker] = useState<WorkerDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    managerApi.workerDetail(id)
      .then((data) => setWorker(data.worker as WorkerDetailData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-32 bg-gray-200 rounded-xl" /><div className="h-40 bg-gray-200 rounded-xl" /></div>;
  }

  if (!worker) {
    return <p className="text-gray-400 text-center py-8">{t('manager.workerNotFound')}</p>;
  }

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate('/manager/workers')} className="text-sm text-gray-500 mb-4 hover:text-gray-700">
        ← {t('common.back')}
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-4">
        <div className="flex items-center gap-4">
          {worker.user.avatarUrl ? (
            <img src={worker.user.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-700">
              {worker.user.firstName[0]}{worker.user.lastName[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{worker.user.firstName} {worker.user.lastName}</h1>
            <p className="text-gray-500">{worker.user.email}</p>
            {worker.user.phone && <p className="text-gray-500">{worker.user.phone}</p>}
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${worker.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {worker.isAvailable ? t('manager.available') : t('manager.unavailable')}
              </span>
              {worker.rating > 0 && <span className="text-sm text-amber-600">{worker.rating.toFixed(1)}/5</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Infos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-2">{t('manager.workerInfo')}</h3>
          <div className="space-y-1 text-sm">
            <Row label={t('auth.address')} value={worker.address} />
            <Row label={t('auth.city')} value={worker.city} />
            <Row label={t('profileMenu.transportMode')} value={worker.transportMode} />
            <Row label={t('profileMenu.workPreference')} value={worker.workPreference} />
            <Row label="Experience" value={`${worker.experienceYears} ans`} />
            <Row label={t('enterprise.hourlyRate')} value={worker.hourlyRate ? `${worker.hourlyRate}$/h` : null} />
            <Row label="Missions" value={String(worker.totalMissions)} />
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-2">{t('manager.skillsAndServices')}</h3>
          {worker.skills.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-1">Skills</p>
              <div className="flex flex-wrap gap-1">
                {worker.skills.map((s) => <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{s}</span>)}
              </div>
            </div>
          )}
          {worker.serviceTypes.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Services</p>
              <div className="flex flex-wrap gap-1">
                {worker.serviceTypes.map((s) => <span key={s} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">{s}</span>)}
              </div>
            </div>
          )}
          {worker.bio && <p className="mt-2 text-sm text-gray-600">{worker.bio}</p>}
        </div>
      </div>

      {/* Contrats */}
      <div className="bg-white rounded-xl border shadow-sm p-4 mb-4">
        <h3 className="font-semibold text-gray-900 mb-2">{t('enterprise.contracts')} ({worker.contracts.length})</h3>
        {worker.contracts.length === 0 ? (
          <p className="text-sm text-gray-400">{t('manager.noContracts')}</p>
        ) : (
          <div className="space-y-2">
            {worker.contracts.map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                <div>
                  <span className="font-medium">{c.mission.title}</span>
                  <span className="text-gray-400 ml-2">{c.mission.company.companyName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{c.hourlyRate}$/h</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    c.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Derniers pointages */}
      {worker.timePunches.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-2">{t('manager.recentPunches')}</h3>
          <div className="space-y-1">
            {worker.timePunches.slice(0, 10).map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full ${p.type === 'PUNCH_IN' ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="font-medium">{p.type === 'PUNCH_IN' ? t('timepunch.punchIn') : t('timepunch.punchOut')}</span>
                <span className="text-gray-500">{new Date(p.timestamp).toLocaleString('fr-CA')}</span>
                {!p.isWithinZone && <span className="text-xs text-red-500">{t('timepunch.outOfZone')}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium">{value || '—'}</span>
    </div>
  );
}
