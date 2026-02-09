import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../services/api';

interface CompanyOption { id: string; companyName: string; user: { firstName: string; lastName: string } }

export default function CreateMission() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    companyId: '',
    title: '',
    description: '',
    serviceType: 'MENAGE_ENTREPRISE',
    address: '',
    city: '',
    postalCode: '',
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '16:00',
    hourlyRate: 18,
    requiredWorkers: 1,
    postType: 'MENAGE',
    isUrgent: false,
    breakDuration: '30min',
    dressCode: '',
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    managerApi.companies()
      .then((data) => setCompanies(data.companies as CompanyOption[]))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyId) { alert(t('manager.selectCompany')); return; }
    setSaving(true);
    try {
      await managerApi.createMission({
        ...form,
        hourlyRate: Number(form.hourlyRate),
        requiredWorkers: Number(form.requiredWorkers),
        latitude: Number(form.latitude) || undefined,
        longitude: Number(form.longitude) || undefined,
      });
      navigate('/manager/missions');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const postTypes = ['MENAGE', 'DEMENAGEMENT', 'MANUTENTION', 'AIDE_GENERALE'];
  const serviceTypes = ['MENAGE_DOMICILE', 'MENAGE_ENTREPRISE', 'DEMENAGEMENT'];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('manager.createMission')}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Entreprise */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('manager.company')}</label>
          <select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">{t('manager.selectCompany')}</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterprise.missionTitle')}</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('manager.postType')}</label>
            <select value={form.postType} onChange={(e) => setForm({ ...form, postType: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
              {postTypes.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterprise.description')}</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterprise.serviceType')}</label>
          <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
            {serviceTypes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.address')}</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.city')}</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.postalCode')}</label>
            <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterprise.startDate')}</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterprise.endDate')}</label>
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterprise.startTime')}</label>
            <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterprise.endTime')}</label>
            <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterprise.hourlyRate')}</label>
            <input type="number" step="0.5" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterprise.requiredWorkers')}</label>
            <input type="number" value={form.requiredWorkers} onChange={(e) => setForm({ ...form, requiredWorkers: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 border rounded-lg text-sm" min={1} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('manager.breakDuration')}</label>
            <input value={form.breakDuration} onChange={(e) => setForm({ ...form, breakDuration: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('manager.dressCode')}</label>
            <input value={form.dressCode} onChange={(e) => setForm({ ...form, dressCode: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="isUrgent" checked={form.isUrgent} onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })} className="rounded" />
          <label htmlFor="isUrgent" className="text-sm font-medium text-gray-700">{t('manager.markUrgent')}</label>
        </div>

        <button type="submit" disabled={saving} className="w-full py-2.5 bg-manager-600 text-white font-semibold rounded-lg hover:bg-manager-700 disabled:opacity-50 transition-colors">
          {saving ? t('common.loading') : t('manager.createMission')}
        </button>
      </form>
    </div>
  );
}
