import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { managerApi } from '../../services/api';

interface ReportData {
  id: string;
  content: string;
  authorRole: string;
  createdAt: string;
  mission: { title: string; company: { companyName: string } };
  author: { firstName: string; lastName: string; role: string; avatarUrl: string | null };
}

interface MissionOption {
  id: string;
  title: string;
  company: { companyName: string };
}

export default function ManagerReports() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [missions, setMissions] = useState<MissionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ missionId: '', content: '' });

  useEffect(() => {
    Promise.all([
      managerApi.reports(),
      managerApi.missions(),
    ])
      .then(([reportsData, missionsData]) => {
        setReports(reportsData.reports as ReportData[]);
        setMissions(missionsData.missions as MissionOption[]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.missionId || !form.content.trim()) return;
    setSaving(true);
    try {
      await managerApi.createReport({ missionId: form.missionId, content: form.content });
      setForm({ missionId: '', content: '' });
      setShowForm(false);
      const data = await managerApi.reports();
      setReports(data.reports as ReportData[]);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      WORKER: 'bg-green-100 text-green-700',
      MANAGER: 'bg-amber-100 text-amber-700',
      ENTERPRISE: 'bg-purple-100 text-purple-700',
    };
    return `px-2 py-0.5 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100 text-gray-600'}`;
  };

  if (loading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('manager.reports')}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-manager-600 text-white rounded-lg text-sm font-medium hover:bg-manager-700"
        >
          {showForm ? t('common.cancel') : t('manager.newReport')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border shadow-sm p-4 mb-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('manager.selectMission')}</label>
            <select
              value={form.missionId}
              onChange={(e) => setForm({ ...form, missionId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            >
              <option value="">—</option>
              {missions.map((m) => (
                <option key={m.id} value={m.id}>{m.title} ({m.company.companyName})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('manager.reportContent')}</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-manager-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </form>
      )}

      {reports.length === 0 ? (
        <p className="text-gray-400 text-center py-8">{t('manager.noReports')}</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {r.author.avatarUrl ? (
                    <img src={r.author.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                      {r.author.firstName[0]}{r.author.lastName[0]}
                    </div>
                  )}
                  <span className="font-medium text-gray-900">{r.author.firstName} {r.author.lastName}</span>
                  <span className={roleBadge(r.authorRole)}>{r.authorRole}</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString('fr-CA')}</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">{r.mission.title} — {r.mission.company.companyName}</p>
              <p className="text-sm text-gray-800">{r.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
