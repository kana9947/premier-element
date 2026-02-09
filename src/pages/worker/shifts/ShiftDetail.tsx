import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { shiftsApi } from '../../../services/api';
import { Shift } from '../../../types/worker';

export default function ShiftDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showDelayForm, setShowDelayForm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(10);
  const [delayReason, setDelayReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (!id) return;
    shiftsApi.detail(id)
      .then((data) => setShift(data.shift as Shift))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!id) return;
    setApplying(true);
    try {
      await shiftsApi.apply(id);
      setApplied(true);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setApplying(false);
    }
  };

  const handleReportDelay = async () => {
    if (!id || !delayReason) return;
    try {
      await shiftsApi.reportDelay(id, { minutes: delayMinutes, reason: delayReason });
      setShowDelayForm(false);
      alert(t('shifts.reportDelay') + ' ✓');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      await shiftsApi.cancel(id, cancelReason);
      navigate('/worker/my-shifts');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-8 text-center text-gray-400">
        Quart introuvable
      </div>
    );
  }

  const date = new Date(shift.startDate).toLocaleDateString('fr-CA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700"
      >
        ← {t('common.back')}
      </button>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-2">
        {shift.isUrgent && (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
            {t('shifts.urgent')}
          </span>
        )}
        {shift.postType && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            {t(`shifts.postTypes.${shift.postType}`) || shift.postType}
          </span>
        )}
      </div>

      {/* Title & company */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{shift.title}</h1>
      <p className="text-gray-500 mb-1">{shift.company.companyName}</p>
      {shift.reference && (
        <p className="text-xs text-gray-400 mb-4">{t('shifts.reference')}: {shift.reference}</p>
      )}

      {/* Info card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 w-6 text-center">📅</span>
          <div>
            <p className="text-sm font-medium text-gray-800 capitalize">{date}</p>
            <p className="text-sm text-gray-500">{shift.startTime} — {shift.endTime}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-gray-400 w-6 text-center">📍</span>
          <div>
            <p className="text-sm text-gray-800">{shift.address}</p>
            <p className="text-sm text-gray-500">{shift.city}, {shift.postalCode}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-gray-400 w-6 text-center">💰</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{shift.hourlyRate.toFixed(2)}$/h</p>
            <p className="text-xs text-gray-400">
              {t('shifts.estimatedTotal')}: ~{shift.estimatedTotal?.toFixed(2)}$
            </p>
          </div>
        </div>

        {shift.breakDuration && (
          <div className="flex items-center gap-3">
            <span className="text-gray-400 w-6 text-center">☕</span>
            <p className="text-sm text-gray-800">{t('shifts.breakDuration')}: {shift.breakDuration}</p>
          </div>
        )}

        {shift.dressCode && (
          <div className="flex items-center gap-3">
            <span className="text-gray-400 w-6 text-center">👔</span>
            <p className="text-sm text-gray-800">{t('shifts.dressCode')}: {shift.dressCode}</p>
          </div>
        )}

        {shift.requiredSkills.length > 0 && (
          <div className="flex items-start gap-3">
            <span className="text-gray-400 w-6 text-center mt-0.5">🛠</span>
            <div className="flex flex-wrap gap-1">
              {shift.requiredSkills.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {shift.description && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">{t('mission.description')}</h3>
          <p className="text-sm text-gray-600 whitespace-pre-line">{shift.description}</p>
        </div>
      )}

      {/* Responsable */}
      {shift.responsable && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">{t('shifts.responsable')}</h3>
          <p className="text-sm text-gray-700">
            {shift.responsable.firstName} {shift.responsable.lastName}
          </p>
          {shift.responsable.phone && (
            <a
              href={`tel:${shift.responsable.phone}`}
              className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-worker-50 text-worker-600 text-sm font-medium rounded-lg"
            >
              📞 {t('shifts.callResponsable')}
            </a>
          )}
        </div>
      )}

      {/* Estimate note */}
      <p className="text-xs text-gray-400 text-center mb-4">{t('shifts.estimateNote')}</p>

      {/* Action buttons */}
      <div className="space-y-2">
        {!applied ? (
          <button
            onClick={handleApply}
            disabled={applying}
            className="w-full py-3 bg-worker-600 text-white font-semibold rounded-xl hover:bg-worker-700 transition-colors disabled:opacity-50"
          >
            {applying ? t('common.loading') : t('shifts.apply')}
          </button>
        ) : (
          <div className="w-full py-3 text-center bg-green-50 text-green-600 font-semibold rounded-xl">
            ✓ {t('shifts.applied')}
          </div>
        )}

        <button
          onClick={() => setShowDelayForm(!showDelayForm)}
          className="w-full py-3 bg-orange-50 text-orange-600 font-medium rounded-xl hover:bg-orange-100 transition-colors"
        >
          {t('shifts.reportDelay')}
        </button>

        <button
          onClick={() => setShowCancelConfirm(!showCancelConfirm)}
          className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors"
        >
          {t('shifts.cancel')}
        </button>
      </div>

      {/* Delay form */}
      {showDelayForm && (
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <h4 className="font-semibold text-gray-800">{t('shifts.reportDelay')}</h4>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('shifts.delayMinutes')}</label>
            <input
              type="number"
              min={1}
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('shifts.delayReason')}</label>
            <input
              type="text"
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <button
            onClick={handleReportDelay}
            className="w-full py-2 bg-orange-500 text-white font-medium rounded-lg"
          >
            {t('common.confirm')}
          </button>
        </div>
      )}

      {/* Cancel confirm */}
      {showCancelConfirm && (
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-red-100 p-4 space-y-3">
          <p className="text-sm text-red-600 font-medium">{t('shifts.cancelConfirm')}</p>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('shifts.cancelReason')}</label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <button
            onClick={handleCancel}
            className="w-full py-2 bg-red-500 text-white font-medium rounded-lg"
          >
            {t('shifts.cancel')}
          </button>
        </div>
      )}
    </div>
  );
}
