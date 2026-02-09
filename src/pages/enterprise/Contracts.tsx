import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { companiesApi } from '../../services/api';

interface Contract {
  id: string;
  startDate: string;
  endDate: string | null;
  hourlyRate: number;
  status: string;
  mission: { title: string; serviceType: string };
  worker: { user: { firstName: string; lastName: string } };
  payments: { amount: number; status: string }[];
}

export default function EnterpriseContracts() {
  const { t } = useTranslation();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companiesApi.contracts()
      .then((data) => setContracts(data.contracts as Contract[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">{t('common.loading')}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('enterprise.contracts')}</h1>

      {contracts.length === 0 ? (
        <p className="text-gray-500 text-center py-12">{t('common.noResults')}</p>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => {
            const totalPaid = contract.payments
              .filter(p => p.status === 'COMPLETED')
              .reduce((sum, p) => sum + p.amount, 0);

            return (
              <div key={contract.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{contract.mission.title}</h3>
                    <p className="text-sm text-gray-500">
                      {contract.worker.user.firstName} {contract.worker.user.lastName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {contract.hourlyRate}$/h - Depuis {new Date(contract.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      contract.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      contract.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {contract.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-2">Total: ${totalPaid.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
