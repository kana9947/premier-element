import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { shiftsApi } from '../../../services/api';
import { useShiftStore } from '../../../stores/shiftStore';
import { Shift } from '../../../types/worker';
import ShiftListView from './ShiftListView';
import ShiftCalendarView from './ShiftCalendarView';
import ShiftMapView from './ShiftMapView';

export default function AvailableShifts() {
  const { t } = useTranslation();
  const { viewMode, setViewMode } = useShiftStore();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPostType, setFilterPostType] = useState('');
  const [filterUrgent, setFilterUrgent] = useState(false);

  const loadShifts = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    try {
      const queryParams: Record<string, string> = { ...params };
      if (filterPostType) queryParams.postType = filterPostType;
      if (filterUrgent) queryParams.urgent = 'true';

      const data = await shiftsApi.available(queryParams);
      setShifts(data.shifts as Shift[]);
    } catch (err) {
      console.error('Load shifts error:', err);
    } finally {
      setLoading(false);
    }
  }, [filterPostType, filterUrgent]);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const handleMonthChange = (month: string) => {
    loadShifts({ month });
  };

  const viewButtons: { key: typeof viewMode; label: string }[] = [
    { key: 'list', label: t('shifts.listView') },
    { key: 'calendar', label: t('shifts.calendarView') },
    { key: 'map', label: t('shifts.mapView') },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      <h1 className="text-xl font-bold text-gray-900 mb-4">{t('shifts.available')}</h1>

      {/* View mode toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        {viewButtons.map((v) => (
          <button
            key={v.key}
            onClick={() => setViewMode(v.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === v.key
                ? 'bg-white text-worker-600 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        <select
          value={filterPostType}
          onChange={(e) => setFilterPostType(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
        >
          <option value="">{t('shifts.postType')}</option>
          <option value="MENAGE">{t('shifts.postTypes.MENAGE')}</option>
          <option value="DEMENAGEMENT">{t('shifts.postTypes.DEMENAGEMENT')}</option>
          <option value="MANUTENTION">{t('shifts.postTypes.MANUTENTION')}</option>
          <option value="AIDE_GENERALE">{t('shifts.postTypes.AIDE_GENERALE')}</option>
        </select>

        <button
          onClick={() => setFilterUrgent(!filterUrgent)}
          className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            filterUrgent
              ? 'border-red-300 bg-red-50 text-red-600'
              : 'border-gray-200 text-gray-500'
          }`}
        >
          {t('shifts.urgent')}
        </button>
      </div>

      {/* Content */}
      {viewMode === 'list' && <ShiftListView shifts={shifts} loading={loading} />}
      {viewMode === 'calendar' && (
        <ShiftCalendarView shifts={shifts} loading={loading} onMonthChange={handleMonthChange} />
      )}
      {viewMode === 'map' && <ShiftMapView />}
    </div>
  );
}
