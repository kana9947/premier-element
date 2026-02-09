import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shift } from '../../../types/worker';

interface Props {
  shifts: Shift[];
  loading: boolean;
  onMonthChange: (month: string) => void;
}

export default function ShiftCalendarView({ shifts, loading, onMonthChange }: Props) {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = currentDate.toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' });

  const changeMonth = (delta: number) => {
    const newDate = new Date(year, month + delta, 1);
    setCurrentDate(newDate);
    const m = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(m);
  };

  // Group shifts by day
  const shiftsByDay: Record<number, Shift[]> = {};
  shifts.forEach((s) => {
    const d = new Date(s.startDate).getDate();
    if (!shiftsByDay[d]) shiftsByDay[d] = [];
    shiftsByDay[d].push(s);
  });

  const days = [];
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-20" />);
  }
  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dayShifts = shiftsByDay[d] || [];
    const isToday =
      d === new Date().getDate() &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();

    days.push(
      <div
        key={d}
        className={`h-20 border border-gray-100 rounded-lg p-1 ${
          isToday ? 'bg-worker-50 border-worker-300' : 'bg-white'
        }`}
      >
        <span className={`text-xs font-medium ${isToday ? 'text-worker-600' : 'text-gray-500'}`}>
          {d}
        </span>
        <div className="mt-0.5 space-y-0.5 overflow-hidden">
          {dayShifts.slice(0, 2).map((s) => (
            <div
              key={s.id}
              onClick={() => navigate(`/worker/shifts/${s.id}`)}
              className={`text-[10px] leading-tight truncate px-1 py-0.5 rounded cursor-pointer ${
                s.isUrgent
                  ? 'bg-red-100 text-red-700'
                  : 'bg-worker-100 text-worker-700'
              }`}
            >
              {s.startTime} {s.title}
            </div>
          ))}
          {dayShifts.length > 2 && (
            <span className="text-[10px] text-gray-400">+{dayShifts.length - 2}</span>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-worker-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          ‹
        </button>
        <h3 className="font-semibold text-gray-800 capitalize">{monthLabel}</h3>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  );
}
