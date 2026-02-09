import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PaymentMethodData } from '../../../types/worker';

// Extend workersApi for payment methods
const paymentMethodsApi = {
  get: () => fetch('/api/workers/payment-methods', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json()),
  update: (data: Record<string, string>) => fetch('/api/workers/payment-methods', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(r => r.json()),
};

export default function PaymentMethods() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [method, setMethod] = useState<PaymentMethodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    transitNumber: '',
    institutionCode: '',
    folioNumber: '',
  });

  useEffect(() => {
    paymentMethodsApi.get()
      .then((data: { method: PaymentMethodData | null }) => {
        setMethod(data.method);
        if (data.method) {
          setForm({
            transitNumber: data.method.transitNumber,
            institutionCode: data.method.institutionCode,
            folioNumber: data.method.folioNumber,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await paymentMethodsApi.update(form);
      if (result.errors) {
        alert(result.errors.map((e: { message: string }) => e.message).join(', '));
        return;
      }
      setMethod(result.method);
      setEditing(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
      <button
        onClick={() => navigate('/worker/profile')}
        className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700"
      >
        ← {t('common.back')}
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-4">{t('profileMenu.paymentMethods')}</h1>

      {/* Visual guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
        <p className="text-sm text-blue-700">{t('profileMenu.bankVisualGuide')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {!editing && method ? (
          <div className="space-y-3">
            <InfoRow label={t('profileMenu.transitNumber')} value={method.transitNumber} />
            <InfoRow label={t('profileMenu.institutionCode')} value={method.institutionCode} />
            <InfoRow label={t('profileMenu.folioNumber')} value={method.folioNumber} />
            {method.sinMasked && <InfoRow label={t('profileMenu.sin')} value={method.sinMasked} />}

            <button
              onClick={() => setEditing(true)}
              className="w-full mt-4 py-2 bg-worker-600 text-white font-medium rounded-lg hover:bg-worker-700 transition-colors text-sm"
            >
              {t('common.edit')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {!method && !editing && (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-4">Aucun mode de paiement configuré.</p>
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-2 bg-worker-600 text-white font-medium rounded-lg text-sm"
                >
                  Configurer
                </button>
              </div>
            )}

            {editing && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('profileMenu.transitNumber')}</label>
                  <input
                    type="text"
                    value={form.transitNumber}
                    onChange={(e) => setForm({ ...form, transitNumber: e.target.value })}
                    placeholder="12345"
                    maxLength={5}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('profileMenu.institutionCode')}</label>
                  <input
                    type="text"
                    value={form.institutionCode}
                    onChange={(e) => setForm({ ...form, institutionCode: e.target.value })}
                    placeholder="001"
                    maxLength={3}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('profileMenu.folioNumber')}</label>
                  <input
                    type="text"
                    value={form.folioNumber}
                    onChange={(e) => setForm({ ...form, folioNumber: e.target.value })}
                    placeholder="1234567"
                    maxLength={12}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2 bg-worker-600 text-white font-medium rounded-lg text-sm disabled:opacity-50"
                  >
                    {saving ? t('common.loading') : t('common.save')}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-800 font-medium font-mono">{value}</span>
    </div>
  );
}
