import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useTestModeStore } from '../../stores/testModeStore';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const { isTestMode } = useTestModeStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const autoFillEnterprise = () => {
    setEmail('demo-entreprise@workerapp.com');
    setPassword('demo1234');
  };
  const autoFillWorker = () => {
    setEmail('demo-travailleur@workerapp.com');
    setPassword('demo1234');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(email, password);

    const { user } = useAuthStore.getState();
    if (user) {
      navigate(user.role === 'ENTERPRISE' ? '/enterprise' : '/worker');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-primary-600">{t('common.appName')}</Link>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">{t('auth.login')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          {isTestMode && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-orange-600 mb-2">Auto-remplissage rapide :</p>
              <div className="flex gap-2">
                <button type="button" onClick={autoFillEnterprise}
                  className="flex-1 py-2 bg-purple-100 text-purple-700 text-xs font-medium rounded-lg hover:bg-purple-200 transition-colors">
                  Entreprise
                </button>
                <button type="button" onClick={autoFillWorker}
                  className="flex-1 py-2 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 transition-colors">
                  Travailleur
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="email@exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? t('common.loading') : t('auth.login')}
          </button>

          <p className="text-center text-sm text-gray-600">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              {t('auth.register')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
