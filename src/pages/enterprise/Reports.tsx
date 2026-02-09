import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { companiesApi } from '../../services/api';

interface ReportData {
  id: string;
  content: string;
  authorRole: string;
  createdAt: string;
  mission: { title: string };
  author: { firstName: string; lastName: string; role: string; avatarUrl: string | null };
}

export default function EnterpriseReports() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companiesApi.reports()
      .then((data) => setReports((data as { reports: ReportData[] }).reports))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}</div>;
  }

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      WORKER: 'bg-green-100 text-green-700',
      MANAGER: 'bg-amber-100 text-amber-700',
    };
    return `px-2 py-0.5 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100 text-gray-600'}`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('enterprise.reports')}</h1>

      {reports.length === 0 ? (
        <p className="text-gray-400 text-center py-8">{t('enterprise.noReports')}</p>
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
              <p className="text-sm text-gray-500 mb-1">{r.mission.title}</p>
              <p className="text-sm text-gray-800">{r.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
