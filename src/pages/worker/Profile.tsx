import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { workersApi } from '../../services/api';
import { useTestModeStore, testData } from '../../stores/testModeStore';

interface WorkerProfileData {
  bio: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  skills: string[];
  serviceTypes: string[];
  hourlyRate: number | null;
  isAvailable: boolean;
  rating: number;
  totalMissions: number;
  experienceYears: number;
  user: { firstName: string; lastName: string; email: string; phone: string | null };
}

export default function WorkerProfile() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<WorkerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { isTestMode } = useTestModeStore();
  const [formData, setFormData] = useState({
    bio: '',
    city: '',
    postalCode: '',
    hourlyRate: 15,
    isAvailable: true,
    experienceYears: 0,
    skills: '',
    serviceTypes: [] as string[],
  });

  const autoFill = () => {
    setFormData(testData.workerProfile);
    if (!editMode) setEditMode(true);
  };

  useEffect(() => {
    workersApi.profile()
      .then((data) => {
        const p = data.profile as WorkerProfileData;
        setProfile(p);
        if (p) {
          setFormData({
            bio: p.bio || '',
            city: p.city || '',
            postalCode: p.postalCode || '',
            hourlyRate: p.hourlyRate || 15,
            isAvailable: p.isAvailable,
            experienceYears: p.experienceYears,
            skills: p.skills.join(', '),
            serviceTypes: p.serviceTypes,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        bio: formData.bio,
        city: formData.city,
        postalCode: formData.postalCode,
        hourlyRate: formData.hourlyRate,
        isAvailable: formData.isAvailable,
        experienceYears: formData.experienceYears,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        serviceTypes: formData.serviceTypes,
      };
      const result = await workersApi.updateProfile(data);
      setProfile({ ...(profile as WorkerProfileData), ...(result.profile as Partial<WorkerProfileData>) } as WorkerProfileData);
      setEditMode(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleServiceType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter(t => t !== type)
        : [...prev.serviceTypes, type],
    }));
  };

  if (loading) return <p className="text-gray-500">{t('common.loading')}</p>;
  if (!profile) return <p className="text-gray-500">Profil introuvable</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('worker.myProfile')}</h1>
        <div className="flex gap-2">
          {isTestMode && (
            <button onClick={autoFill}
              className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors">
              Auto-remplir
            </button>
          )}
          {!editMode && (
            <button onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-worker-600 text-white text-sm font-medium rounded-lg hover:bg-worker-700 transition-colors">
              {t('common.edit')}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8">
        {/* Infos utilisateur */}
        <div className="mb-6 pb-6 border-b">
          <h2 className="text-lg font-semibold">{profile.user.firstName} {profile.user.lastName}</h2>
          <p className="text-sm text-gray-500">{profile.user.email}</p>
          {profile.user.phone && <p className="text-sm text-gray-500">{profile.user.phone}</p>}
          <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <span>Missions: {profile.totalMissions}</span>
            <span>Note: {profile.rating}/5</span>
          </div>
        </div>

        {editMode ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-worker-500 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.city')}</label>
                <input type="text" value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-worker-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.postalCode')}</label>
                <input type="text" value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-worker-500 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('worker.hourlyRate')} ($)</label>
                <input type="number" value={formData.hourlyRate} min={1} step={0.5}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-worker-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('worker.experience')}</label>
                <input type="number" value={formData.experienceYears} min={0}
                  onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-worker-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('worker.skills')} (séparées par virgules)</label>
              <input type="text" value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="Nettoyage, Repassage, Vitres..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-worker-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('mission.serviceType')}</label>
              <div className="flex flex-wrap gap-2">
                {(['MENAGE_DOMICILE', 'MENAGE_ENTREPRISE', 'DEMENAGEMENT'] as const).map(type => (
                  <button key={type} type="button" onClick={() => toggleServiceType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                      formData.serviceTypes.includes(type)
                        ? 'border-worker-600 bg-green-50 text-worker-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {type === 'MENAGE_DOMICILE' ? t('mission.menageDomicile') :
                     type === 'MENAGE_ENTREPRISE' ? t('mission.menageEntreprise') :
                     t('mission.demenagement')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-4 h-4 text-worker-600 rounded" />
              <label className="text-sm font-medium text-gray-700">{t('worker.available')}</label>
            </div>

            <div className="flex gap-4">
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-3 bg-worker-600 text-white font-medium rounded-lg hover:bg-worker-700 transition-colors disabled:opacity-50">
                {saving ? t('common.loading') : t('common.save')}
              </button>
              <button onClick={() => setEditMode(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors">
                {t('common.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.bio && <p className="text-gray-700">{profile.bio}</p>}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">{t('auth.city')}:</span> {profile.city || '-'}</div>
              <div><span className="text-gray-500">{t('auth.postalCode')}:</span> {profile.postalCode || '-'}</div>
              <div><span className="text-gray-500">{t('worker.hourlyRate')}:</span> {profile.hourlyRate ? `${profile.hourlyRate}$/h` : '-'}</div>
              <div><span className="text-gray-500">{t('worker.experience')}:</span> {profile.experienceYears} ans</div>
            </div>
            {profile.skills.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">{t('worker.skills')}:</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
