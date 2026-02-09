import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { workersApi, avatarApi } from '../../../services/api';
import { useAuthStore } from '../../../stores/authStore';

interface ProfileData {
  bio: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  hourlyRate: number | null;
  isAvailable: boolean;
  experienceYears: number;
  dateOfBirth: string | null;
  transportMode: string | null;
  workPreference: string | null;
  description: string | null;
  user: { firstName: string; lastName: string; email: string; phone: string | null; avatarUrl: string | null };
}

export default function AccountInfo() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: authUser, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [form, setForm] = useState({
    address: '',
    city: '',
    postalCode: '',
    dateOfBirth: '',
    transportMode: '',
    workPreference: '',
    description: '',
  });

  useEffect(() => {
    workersApi.profile()
      .then((data) => {
        const p = data.profile as ProfileData;
        setProfile(p);
        if (p) {
          setForm({
            address: p.address || '',
            city: p.city || '',
            postalCode: p.postalCode || '',
            dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '',
            transportMode: p.transportMode || '',
            workPreference: p.workPreference || '',
            description: p.description || '',
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await workersApi.updateProfile(form);
      setEditing(false);
      const data = await workersApi.profile();
      setProfile(data.profile as ProfileData);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const { avatarUrl } = await avatarApi.upload(file);
      setProfile((p) => p ? { ...p, user: { ...p.user, avatarUrl } } : p);
      if (authUser) {
        setUser({ ...authUser, avatarUrl });
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-8 text-center text-gray-400">
        Profil introuvable
      </div>
    );
  }

  const transportModes = ['CAR', 'PUBLIC_TRANSIT', 'BICYCLE', 'WALKING'];
  const workPrefs = [
    { value: 'FULL_TIME', label: t('profileMenu.fullTime') },
    { value: 'PART_TIME', label: t('profileMenu.partTime') },
    { value: 'FEW_SHIFTS', label: t('profileMenu.fewShifts') },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
      <button
        onClick={() => navigate('/worker/profile')}
        className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700"
      >
        ← {t('common.back')}
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-4">{t('profileMenu.accountInfo')}</h1>

      {/* Read-only user info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center gap-4 mb-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-worker-100 flex items-center justify-center">
              {profile.user.avatarUrl ? (
                <img src={profile.user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl text-worker-600">
                  {profile.user.firstName.charAt(0)}{profile.user.lastName.charAt(0)}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-worker-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-worker-700 transition-colors disabled:opacity-50"
            >
              {uploadingAvatar ? (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" /></svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3" /></svg>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{profile.user.firstName} {profile.user.lastName}</h2>
            <p className="text-sm text-gray-500">{profile.user.email}</p>
            {profile.user.phone && <p className="text-sm text-gray-500">{profile.user.phone}</p>}
          </div>
        </div>
        <p className="text-xs text-gray-400">{t('profileMenu.contactSupport')}</p>
      </div>

      {/* Editable info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {!editing ? (
          <div className="space-y-3">
            <InfoRow label={t('auth.address')} value={profile.address} />
            <InfoRow label={t('auth.city')} value={profile.city} />
            <InfoRow label={t('auth.postalCode')} value={profile.postalCode} />
            <InfoRow
              label={t('profileMenu.dateOfBirth')}
              value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('fr-CA') : null}
            />
            <InfoRow
              label={t('profileMenu.transportMode')}
              value={profile.transportMode ? t(`shifts.transportModes.${profile.transportMode}`) : null}
            />
            <InfoRow
              label={t('profileMenu.workPreference')}
              value={
                profile.workPreference === 'FULL_TIME' ? t('profileMenu.fullTime') :
                profile.workPreference === 'PART_TIME' ? t('profileMenu.partTime') :
                profile.workPreference === 'FEW_SHIFTS' ? t('profileMenu.fewShifts') :
                profile.workPreference
              }
            />
            <InfoRow label={t('profileMenu.description')} value={profile.description} />

            <button
              onClick={() => setEditing(true)}
              className="w-full mt-4 py-2 bg-worker-600 text-white font-medium rounded-lg hover:bg-worker-700 transition-colors text-sm"
            >
              {t('common.edit')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Field label={t('auth.address')} value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
            <Field label={t('auth.city')} value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Field label={t('auth.postalCode')} value={form.postalCode} onChange={(v) => setForm({ ...form, postalCode: v })} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profileMenu.dateOfBirth')}</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profileMenu.transportMode')}</label>
              <select
                value={form.transportMode}
                onChange={(e) => setForm({ ...form, transportMode: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">—</option>
                {transportModes.map((m) => (
                  <option key={m} value={m}>{t(`shifts.transportModes.${m}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profileMenu.workPreference')}</label>
              <select
                value={form.workPreference}
                onChange={(e) => setForm({ ...form, workPreference: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">—</option>
                {workPrefs.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profileMenu.description')}</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
              />
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

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value || '—'}</span>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-sm"
      />
    </div>
  );
}
