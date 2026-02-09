import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Shift } from '../../../types/worker';

interface Props {
  shift: Shift;
}

export default function ShiftCard({ shift }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const date = new Date(shift.startDate).toLocaleDateString('fr-CA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div
      onClick={() => navigate(`/worker/shifts/${shift.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Top row: badges */}
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
        {shift.reference && (
          <span className="text-xs text-gray-400 ml-auto">{shift.reference}</span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 mb-1">{shift.title}</h3>

      {/* Company */}
      <p className="text-sm text-gray-500 mb-2">{shift.company.companyName}</p>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-y-1 text-sm mb-3">
        <div className="text-gray-500">
          <span className="inline-block w-4">📅</span> {date}
        </div>
        <div className="text-gray-500">
          <span className="inline-block w-4">🕐</span> {shift.startTime} - {shift.endTime}
        </div>
        <div className="text-gray-500">
          <span className="inline-block w-4">📍</span> {shift.city}
        </div>
        <div className="text-gray-900 font-semibold">
          {shift.hourlyRate.toFixed(2)}$/h
        </div>
      </div>

      {/* Bottom: estimated total */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">{t('shifts.estimatedTotal')}</span>
        <span className="text-sm font-bold text-worker-600">
          ~{shift.estimatedTotal?.toFixed(2) || '—'}$
        </span>
      </div>
    </div>
  );
}
