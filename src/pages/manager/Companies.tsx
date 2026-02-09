import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { managerApi } from '../../services/api';

interface CompanyData {
  id: string;
  companyName: string;
  address: string;
  city: string;
  isVerified: boolean;
  user: { firstName: string; lastName: string; email: string; phone: string | null };
  _count: { missions: number; contracts: number };
}

export default function ManagerCompanies() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    managerApi.companies()
      .then((data) => setCompanies(data.companies as CompanyData[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('manager.companies')}</h1>

      {companies.length === 0 ? (
        <p className="text-gray-400 text-center py-8">{t('manager.noCompanies')}</p>
      ) : (
        <div className="space-y-3">
          {companies.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{c.companyName}</h3>
                    {c.isVerified && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">{t('manager.verified')}</span>}
                  </div>
                  <p className="text-sm text-gray-500">{c.user.firstName} {c.user.lastName} — {c.user.email}</p>
                  <p className="text-sm text-gray-400">{c.address}, {c.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{c._count.missions} missions</p>
                  <p className="text-sm text-gray-600">{c._count.contracts} {t('enterprise.contracts').toLowerCase()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
