import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useTestModeStore, testData } from '../../stores/testModeStore';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [role, setRole] = useState<'ENTERPRISE' | 'WORKER'>(
    (searchParams.get('role') as 'ENTERPRISE' | 'WORKER') || 'WORKER'
  );
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    siret: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const { isTestMode } = useTestModeStore();
  const [validationError, setValidationError] = useState('');

  const autoFill = () => {
    const data = role === 'ENTERPRISE' ? testData.registerEnterprise : testData.registerWorker;
    setFormData(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      setValidationError(t('validation.passwordTooShort'));
      return;
    }

    await register({
      ...formData,
      role,
      language: localStorage.getItem('language')?.toUpperCase() || 'FR',
    });

    const { user } = useAuthStore.getState();
    if (user) {
      navigate(user.role === 'ENTERPRISE' ? '/enterprise' : '/worker');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-primary-600">{t('common.appName')}</Link>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">{t('auth.register')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-8 space-y-6">
          {(error || validationError) && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error || validationError}</div>
          )}

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

          {/* Sélection du rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.registerAs')}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('ENTERPRISE')}
                className={`py-3 rounded-lg font-medium text-sm border-2 transition-colors ${
                  role === 'ENTERPRISE'
                    ? 'border-enterprise-600 bg-enterprise-50 text-enterprise-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {t('auth.enterprise')}
              </button>
              <button
                type="button"
                onClick={() => setRole('WORKER')}
                className={`py-3 rounded-lg font-medium text-sm border-2 transition-colors ${
                  role === 'WORKER'
                    ? 'border-worker-600 bg-green-50 text-worker-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {t('auth.worker')}
              </button>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.firstName')}</label>
              <input
                type="text" name="firstName" value={formData.firstName} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.lastName')}</label>
              <input
                type="text" name="lastName" value={formData.lastName} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
            <input
              type="email" name="email" value={formData.email} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.phone')}</label>
            <input
              type="tel" name="phone" value={formData.phone} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
              <input
                type="password" name="password" value={formData.password} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirmPassword')}</label>
              <input
                type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Champs entreprise */}
          {role === 'ENTERPRISE' && (
            <>
              <hr className="border-gray-200" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.companyName')}</label>
                <input
                  type="text" name="companyName" value={formData.companyName} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.siret')}</label>
                <input
                  type="text" name="siret" value={formData.siret} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.city')}</label>
                  <input
                    type="text" name="city" value={formData.city} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.postalCode')}</label>
                  <input
                    type="text" name="postalCode" value={formData.postalCode} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 ${
              role === 'ENTERPRISE'
                ? 'bg-enterprise-600 hover:bg-enterprise-700'
                : 'bg-worker-600 hover:bg-worker-700'
            }`}
          >
            {isLoading ? t('common.loading') : t('auth.register')}
          </button>

          <p className="text-center text-sm text-gray-600">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
