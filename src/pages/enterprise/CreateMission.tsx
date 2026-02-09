import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { missionsApi } from '../../services/api';
import { useTestModeStore, testData } from '../../stores/testModeStore';

export default function CreateMission() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: 'MENAGE_ENTREPRISE',
    address: '',
    city: '',
    postalCode: '',
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '17:00',
    hourlyRate: 15,
    requiredWorkers: 1,
    isRecurring: false,
    requiredSkills: [] as string[],
  });

  const { isTestMode } = useTestModeStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const autoFill = () => {
    setFormData(testData.createMission);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked
             : type === 'number' ? parseFloat(value)
             : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await missionsApi.create(formData);
      navigate('/enterprise/missions');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('enterprise.createMission')}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

        {isTestMode && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-orange-600">Mode Test : remplir automatiquement</p>
              <button type="button" onClick={autoFill}
                className="px-4 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors">
                Auto-remplir
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('mission.title')}</label>
          <input
            type="text" name="title" value={formData.title} onChange={handleChange} required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-enterprise-500 focus:border-enterprise-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('mission.description')}</label>
          <textarea
            name="description" value={formData.description} onChange={handleChange} required rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-enterprise-500 focus:border-enterprise-500 outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('mission.serviceType')}</label>
          <select
            name="serviceType" value={formData.serviceType} onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-enterprise-500 focus:border-enterprise-500 outline-none"
          >
            <option value="MENAGE_DOMICILE">{t('mission.menageDomicile')}</option>
            <option value="MENAGE_ENTREPRISE">{t('mission.menageEntreprise')}</option>
            <option value="DEMENAGEMENT">{t('mission.demenagement')}</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.address')}</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-enterprise-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.city')}</label>
            <input type="text" name="city" value={formData.city} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-enterprise-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.postalCode')}</label>
            <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-enterprise-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('mission.startDate')}</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-enterprise-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('mission.endDate')}</label>
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-enterprise-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('mission.schedule')} - Début</label>
            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-enterprise-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('mission.schedule')} - Fin</label>
            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-enterprise-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('mission.rate')} ($)</label>
            <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} required min={1} step={0.5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-enterprise-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('mission.requiredWorkers')}</label>
            <input type="number" name="requiredWorkers" value={formData.requiredWorkers} onChange={handleChange} required min={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-enterprise-500 outline-none" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" name="isRecurring" checked={formData.isRecurring} onChange={handleChange}
            className="w-4 h-4 text-enterprise-600 rounded" />
          <label className="text-sm font-medium text-gray-700">{t('mission.recurring')}</label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-enterprise-600 text-white font-medium rounded-lg hover:bg-enterprise-700 transition-colors disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('enterprise.createMission')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/enterprise/missions')}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
