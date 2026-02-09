import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { billingApi } from '../../../services/api';
import { TimeDeclarationEntry } from '../../../types/worker';

export default function Billing() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'toDeclare' | 'approved'>('toDeclare');
  const [toDeclare, setToDeclare] = useState<TimeDeclarationEntry[]>([]);
  const [approved, setApproved] = useState<TimeDeclarationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Declaration form state
  const [declaringId, setDeclaringId] = useState<string | null>(null);
  const [actualHours, setActualHours] = useState(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    billingApi.list()
      .then((data) => {
        setToDeclare(data.toDeclare as TimeDeclarationEntry[]);
        setApproved(data.approved as TimeDeclarationEntry[]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDeclare = async (id: string) => {
    try {
      await billingApi.declare({ declarationId: id, actualHours, note: note || undefined });
      // Refresh
      const data = await billingApi.list();
      setToDeclare(data.toDeclare as TimeDeclarationEntry[]);
      setApproved(data.approved as TimeDeclarationEntry[]);
      setDeclaringId(null);
      setActualHours(0);
      setNote('');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const startDeclare = (entry: TimeDeclarationEntry) => {
    setDeclaringId(entry.id);
    setActualHours(entry.plannedHours);
    setNote('');
  };

  const currentList = tab === 'toDeclare' ? toDeclare : approved;
  const emptyMsg = tab === 'toDeclare' ? t('shifts.noBillingToDeclare') : t('shifts.noBillingApproved');

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      <h1 className="text-xl font-bold text-gray-900 mb-4">{t('shifts.billing')}</h1>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setTab('toDeclare')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'toDeclare' ? 'bg-white text-worker-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          {t('shifts.toDeclare')} ({toDeclare.length})
        </button>
        <button
          onClick={() => setTab('approved')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'approved' ? 'bg-white text-worker-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          {t('shifts.approved')} ({approved.length})
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && currentList.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">{emptyMsg}</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {currentList.map((entry) => {
            const dateStr = new Date(entry.date).toLocaleDateString('fr-CA', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            });

            return (
              <div
                key={entry.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{entry.mission.title}</h3>
                    {entry.mission.reference && (
                      <p className="text-xs text-gray-400">{entry.mission.reference}</p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    entry.status === 'TO_DECLARE' ? 'bg-yellow-100 text-yellow-700' :
                    entry.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {entry.status === 'TO_DECLARE' ? t('shifts.toDeclare') :
                     entry.status === 'APPROVED' ? t('shifts.approved') :
                     entry.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-2">
                  <span>📅 {dateStr}</span>
                  <span>🕐 {entry.mission.startTime} - {entry.mission.endTime}</span>
                  <span>{t('shifts.plannedHours')}: {entry.plannedHours}h</span>
                  <span>{t('shifts.hourlyRate')}: {entry.hourlyRate.toFixed(2)}$/h</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{t('shifts.estimatedTotal')}</span>
                  <span className="font-bold text-worker-600">{entry.estimatedAmount.toFixed(2)}$</span>
                </div>

                {entry.actualHours !== null && (
                  <div className="mt-1 text-sm text-gray-500">
                    {t('shifts.actualHours')}: {entry.actualHours}h
                    {entry.note && <span className="ml-2 text-xs">— {entry.note}</span>}
                  </div>
                )}

                {/* Declare button */}
                {tab === 'toDeclare' && entry.status === 'TO_DECLARE' && declaringId !== entry.id && (
                  <button
                    onClick={() => startDeclare(entry)}
                    className="mt-3 w-full py-2 bg-worker-600 text-white font-medium rounded-lg hover:bg-worker-700 transition-colors text-sm"
                  >
                    {t('shifts.declareHours')}
                  </button>
                )}

                {/* Declare form */}
                {declaringId === entry.id && (
                  <div className="mt-3 space-y-2 pt-3 border-t border-gray-100">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">{t('shifts.actualHours')}</label>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={actualHours}
                        onChange={(e) => setActualHours(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Note</label>
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="Optionnel..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeclare(entry.id)}
                        className="flex-1 py-2 bg-worker-600 text-white font-medium rounded-lg text-sm"
                      >
                        {t('common.confirm')}
                      </button>
                      <button
                        onClick={() => setDeclaringId(null)}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
