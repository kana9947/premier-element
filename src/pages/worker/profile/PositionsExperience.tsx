import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { workersApi } from '../../../services/api';

interface ProfileData {
  skills: string[];
  serviceTypes: string[];
  hourlyRate: number | null;
  experienceYears: number;
}

export default function PositionsExperience() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    skills: '',
    serviceTypes: [] as string[],
    hourlyRate: 15,
    experienceYears: 0,
  });

  useEffect(() => {
    workersApi.profile()
      .then((data) => {
        const p = data.profile as ProfileData;
        setProfile(p);
        if (p) {
          setForm({
            skills: p.skills.join(', '),
            serviceTypes: p.serviceTypes,
            hourlyRate: p.hourlyRate || 15,
            experienceYears: p.experienceYears,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleServiceType = (type: string) => {
    setForm((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter((t) => t !== type)
        : [...prev.serviceTypes, type],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await workersApi.updateProfile({
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        serviceTypes: form.serviceTypes,
        hourlyRate: form.hourlyRate,
        experienceYears: form.experienceYears,
      });
      setEditing(false);
      const data = await workersApi.profile();
      setProfile(data.profile as ProfileData);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const serviceTypeOptions = [
    { value: 'MENAGE_DOMICILE', label: t('mission.menageDomicile') },
    { value: 'MENAGE_ENTREPRISE', label: t('mission.menageEntreprise') },
    { value: 'DEMENAGEMENT', label: t('mission.demenagement') },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
      <button
        onClick={() => navigate('/worker/profile')}
        className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700"
      >
        ← {t('common.back')}
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-4">{t('profileMenu.positions')}</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {!editing ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">{t('worker.skills')}</h3>
              {profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <span key={s} className="px-3 py-1 bg-worker-50 text-worker-700 rounded-full text-sm">{s}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">—</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">{t('mission.serviceType')}</h3>
              {profile.serviceTypes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.serviceTypes.map((st) => (
                    <span key={st} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {serviceTypeOptions.find((o) => o.value === st)?.label || st}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">—</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <span className="text-sm text-gray-500">{t('worker.hourlyRate')}</span>
                <p className="text-lg font-semibold text-gray-800">{profile.hourlyRate || '—'}$/h</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">{t('worker.experience')}</span>
                <p className="text-lg font-semibold text-gray-800">{profile.experienceYears} ans</p>
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="w-full mt-2 py-2 bg-worker-600 text-white font-medium rounded-lg hover:bg-worker-700 transition-colors text-sm"
            >
              {t('common.edit')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('worker.skills')} (séparées par virgules)
              </label>
              <input
                type="text"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="Nettoyage, Repassage..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('mission.serviceType')}</label>
              <div className="flex flex-wrap gap-2">
                {serviceTypeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleServiceType(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-colors ${
                      form.serviceTypes.includes(opt.value)
                        ? 'border-worker-600 bg-green-50 text-worker-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('worker.hourlyRate')} ($)</label>
                <input
                  type="number"
                  min={1}
                  step={0.5}
                  value={form.hourlyRate}
                  onChange={(e) => setForm({ ...form, hourlyRate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('worker.experience')}</label>
                <input
                  type="number"
                  min={0}
                  value={form.experienceYears}
                  onChange={(e) => setForm({ ...form, experienceYears: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 bg-worker-600 text-white font-medium rounded-lg text-sm disabled:opacity-50"
              >
                {saving ? t('common.loading') : t('common.save')}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
