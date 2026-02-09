import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { authApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';

interface DemoAccount {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  detail: string;
}

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const [demoPassword, setDemoPassword] = useState('');
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    authApi.demoAccounts()
      .then((data) => {
        setDemoAccounts(data.accounts);
        setDemoPassword(data.password);
      })
      .catch(() => {});
  }, []);

  const quickLogin = async (email: string) => {
    setConnecting(email);
    await login(email, demoPassword);
    const { user } = useAuthStore.getState();
    if (user) {
      navigate(user.role === 'ENTERPRISE' ? '/enterprise' : '/worker');
    }
    setConnecting(null);
  };

  const enterprises = demoAccounts.filter(a => a.role === 'ENTERPRISE');
  const workers = demoAccounts.filter(a => a.role === 'WORKER');

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <span className="text-2xl font-bold text-primary-600">{t('common.appName')}</span>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              {t('auth.login')}
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t('auth.register')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">{t('landing.title')}</h1>
          <p className="text-xl text-primary-100 mb-12 max-w-2xl mx-auto">{t('landing.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register?role=ENTERPRISE"
              className="px-8 py-4 bg-enterprise-600 hover:bg-enterprise-700 text-white font-semibold rounded-xl text-lg transition-colors shadow-lg"
            >
              {t('landing.ctaEnterprise')}
            </Link>
            <Link
              to="/register?role=WORKER"
              className="px-8 py-4 bg-worker-600 hover:bg-worker-700 text-white font-semibold rounded-xl text-lg transition-colors shadow-lg"
            >
              {t('landing.ctaWorker')}
            </Link>
          </div>
        </div>
      </section>

      {/* Section DEMO - Connexion rapide */}
      {demoAccounts.length > 0 && (
        <section className="py-12 bg-amber-50 border-y-2 border-amber-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1 bg-amber-500 text-white text-xs font-bold rounded-full mb-3">
                MODE DEMO
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Connexion rapide — Cliquez pour tester
              </h2>
              <p className="text-gray-600 mt-2">
                Aucune information requise. Cliquez sur un compte pour explorer l'application.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Entreprises */}
              <div>
                <h3 className="text-sm font-bold text-purple-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  Portail Entreprise
                </h3>
                <div className="space-y-3">
                  {enterprises.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => quickLogin(acc.email)}
                      disabled={connecting !== null}
                      className="w-full text-left bg-white rounded-xl p-4 shadow-sm hover:shadow-md border-2 border-transparent hover:border-purple-300 transition-all disabled:opacity-50 group"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {acc.firstName} {acc.lastName}
                          </p>
                          <p className="text-sm text-purple-600 font-medium">{acc.detail}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          connecting === acc.email
                            ? 'bg-purple-600 text-white animate-pulse'
                            : 'bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white'
                        }`}>
                          {connecting === acc.email ? 'Connexion...' : 'Entrer'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Travailleurs */}
              <div>
                <h3 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  Portail Travailleur
                </h3>
                <div className="space-y-3">
                  {workers.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => quickLogin(acc.email)}
                      disabled={connecting !== null}
                      className="w-full text-left bg-white rounded-xl p-4 shadow-sm hover:shadow-md border-2 border-transparent hover:border-green-300 transition-all disabled:opacity-50 group"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {acc.firstName} {acc.lastName}
                          </p>
                          <p className="text-sm text-green-600 font-medium">
                            {acc.detail || 'Travailleur'}
                          </p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          connecting === acc.email
                            ? 'bg-green-600 text-white animate-pulse'
                            : 'bg-green-100 text-green-700 group-hover:bg-green-600 group-hover:text-white'
                        }`}>
                          {connecting === acc.email ? 'Connexion...' : 'Entrer'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">{t('landing.features.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gray-50">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('landing.features.fast')}</h3>
              <p className="text-gray-600">{t('landing.features.fastDesc')}</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gray-50">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('landing.features.secure')}</h3>
              <p className="text-gray-600">{t('landing.features.secureDesc')}</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gray-50">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('landing.features.quality')}</h3>
              <p className="text-gray-600">{t('landing.features.qualityDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          &copy; {new Date().getFullYear()} {t('common.appName')}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
