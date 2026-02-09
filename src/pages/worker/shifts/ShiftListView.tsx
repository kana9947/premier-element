import { Shift } from '../../../types/worker';
import ShiftCard from './ShiftCard';
import { useTranslation } from 'react-i18next';

interface Props {
  shifts: Shift[];
  loading: boolean;
}

export default function ShiftListView({ shifts, loading }: Props) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">{t('shifts.noShiftsAvailable')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {shifts.map((shift) => (
        <ShiftCard key={shift.id} shift={shift} />
      ))}
    </div>
  );
}
