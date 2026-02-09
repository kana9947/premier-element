import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../services/api';

interface DemoAccount {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  detail: string;
}

export default function DemoBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, login, logout } = useAuthStore();
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [password, setPassword] = useState('');
  const [switching, setSwitching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    authApi.demoAccounts()
      .then((data) => {
        setAccounts(data.accounts);
        setPassword(data.password);
      })
      .catch(console.error);
  }, []);

  const switchAccount = async (email: string, _role: string) => {
    setSwitching(true);
    logout();
    await login(email, password);
    const { user: newUser } = useAuthStore.getState();
    if (newUser) {
      navigate(newUser.role === 'ENTERPRISE' ? '/enterprise' : '/worker');
    }
    setSwitching(false);
    setIsOpen(false);
  };

  if (accounts.length === 0) return null;

  const enterprises = accounts.filter(a => a.role === 'ENTERPRISE');
  const workers = accounts.filter(a => a.role === 'WORKER');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Toggle button */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-1 bg-amber-500 text-white text-xs font-bold rounded-t-lg shadow-lg hover:bg-amber-600 transition-colors"
        >
          {isOpen ? 'Fermer' : 'MODE DEMO'}
          {user && !isOpen && ` — ${user.firstName} ${user.lastName} (${user.role})`}
        </button>
      </div>

      {/* Panel */}
      {isOpen && (
        <div className="bg-gray-900 text-white p-4 shadow-2xl border-t-2 border-amber-500">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-amber-400">
                MODE DEMO — Cliquez sur un compte pour basculer instantanément
              </h3>
              {switching && <span className="text-xs text-amber-300 animate-pulse">{t('common.loading')}</span>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Entreprises */}
              <div>
                <p className="text-xs font-semibold text-purple-400 mb-2 uppercase">Entreprises</p>
                <div className="space-y-1">
                  {enterprises.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => switchAccount(acc.email, acc.role)}
                      disabled={switching}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center ${
                        user?.email === acc.email
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                      } disabled:opacity-50`}
                    >
                      <span>
                        <strong>{acc.firstName} {acc.lastName}</strong>
                        <span className="text-gray-400 ml-2">— {acc.detail}</span>
                      </span>
                      {user?.email === acc.email && (
                        <span className="text-xs bg-purple-500 px-2 py-0.5 rounded">Actif</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travailleurs */}
              <div>
                <p className="text-xs font-semibold text-green-400 mb-2 uppercase">Travailleurs</p>
                <div className="space-y-1">
                  {workers.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => switchAccount(acc.email, acc.role)}
                      disabled={switching}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center ${
                        user?.email === acc.email
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                      } disabled:opacity-50`}
                    >
                      <span>
                        <strong>{acc.firstName} {acc.lastName}</strong>
                        <span className="text-gray-400 ml-2">— {acc.detail || 'Travailleur'}</span>
                      </span>
                      {user?.email === acc.email && (
                        <span className="text-xs bg-green-500 px-2 py-0.5 rounded">Actif</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
