import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { shiftsApi, timepunchApi } from '../../../services/api';
import { MyShift } from '../../../types/worker';

interface PunchData {
  id: string;
  type: string;
  timestamp: string;
  isWithinZone: boolean;
}

export default function MyShifts() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'toConfirm' | 'confirmed'>('toConfirm');
  const [toConfirm, setToConfirm] = useState<MyShift[]>([]);
  const [confirmed, setConfirmed] = useState<MyShift[]>([]);
  const [loading, setLoading] = useState(true);

  // Horodateur state
  const [punchingId, setPunchingId] = useState<string | null>(null);
  const [activePunches, setActivePunches] = useState<Record<string, PunchData | null>>({});
  const [punchHistory, setPunchHistory] = useState<Record<string, PunchData[]>>({});
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Report state
  const [reportMissionId, setReportMissionId] = useState<string | null>(null);
  const [reportContent, setReportContent] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    shiftsApi.mine()
      .then((data) => {
        setToConfirm(data.toConfirm as MyShift[]);
        setConfirmed(data.confirmed as MyShift[]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Load punch status for confirmed shifts
  useEffect(() => {
    confirmed.forEach((item) => {
      timepunchApi.get(item.shift.id)
        .then((data) => {
          setActivePunches((prev) => ({ ...prev, [item.shift.id]: data.activePunch as PunchData | null }));
          setPunchHistory((prev) => ({ ...prev, [item.shift.id]: data.punches as PunchData[] }));
        })
        .catch(console.error);
    });
  }, [confirmed]);

  const handleConfirm = async (missionId: string) => {
    try {
      await shiftsApi.confirm(missionId);
      const data = await shiftsApi.mine();
      setToConfirm(data.toConfirm as MyShift[]);
      setConfirmed(data.confirmed as MyShift[]);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handlePunch = async (missionId: string, type: 'PUNCH_IN' | 'PUNCH_OUT') => {
    setGpsError(null);
    setPunchingId(missionId);

    if (!navigator.geolocation) {
      setGpsError(t('timepunch.gpsNotSupported'));
      setPunchingId(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await timepunchApi.punch({
            missionId,
            type,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          // Refresh punch data
          const data = await timepunchApi.get(missionId);
          setActivePunches((prev) => ({ ...prev, [missionId]: data.activePunch as PunchData | null }));
          setPunchHistory((prev) => ({ ...prev, [missionId]: data.punches as PunchData[] }));
        } catch (err) {
          setGpsError((err as Error).message);
        } finally {
          setPunchingId(null);
        }
      },
      (err) => {
        setGpsError(err.code === 1 ? t('timepunch.gpsRefused') : t('timepunch.gpsError'));
        setPunchingId(null);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmitReport = async (missionId: string) => {
    if (!reportContent.trim()) return;
    setSubmittingReport(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/workers/shifts/${missionId}/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: reportContent }),
      });
      setReportContent('');
      setReportMissionId(null);
      alert(t('reports.submitted'));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmittingReport(false);
    }
  };

  const currentList = tab === 'toConfirm' ? toConfirm : confirmed;
  const emptyMsg = tab === 'toConfirm' ? t('shifts.noShiftsToConfirm') : t('shifts.noShiftsConfirmed');

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      <h1 className="text-xl font-bold text-gray-900 mb-4">{t('shifts.myShifts')}</h1>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setTab('toConfirm')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'toConfirm' ? 'bg-white text-worker-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          {t('shifts.toConfirm')} ({toConfirm.length})
        </button>
        <button
          onClick={() => setTab('confirmed')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'confirmed' ? 'bg-white text-worker-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          {t('shifts.confirmed')} ({confirmed.length})
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && currentList.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">{emptyMsg}</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {currentList.map((item) => {
            const shift = item.shift;
            const date = new Date(shift.startDate).toLocaleDateString('fr-CA', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            });
            const isExpanded = expandedId === shift.id;
            const active = activePunches[shift.id];
            const history = punchHistory[shift.id] || [];

            return (
              <div key={item.contractId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-1">
                  {shift.isUrgent && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                      {t('shifts.urgent')}
                    </span>
                  )}
                  {shift.reference && (
                    <span className="text-xs text-gray-400">{shift.reference}</span>
                  )}
                </div>

                <h3
                  className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-worker-600"
                  onClick={() => navigate(`/worker/shifts/${shift.id}`)}
                >
                  {shift.title}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{shift.company.companyName}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span>{date}</span>
                  <span>{shift.startTime} - {shift.endTime}</span>
                  <span className="font-semibold text-gray-800">{item.hourlyRate.toFixed(2)}$/h</span>
                </div>

                {shift.responsable && (
                  <div className="text-sm text-gray-500 mb-3">
                    {t('shifts.responsable')}: {shift.responsable.firstName} {shift.responsable.lastName}
                    {shift.responsable.phone && (
                      <a href={`tel:${shift.responsable.phone}`} className="ml-2 text-worker-600 font-medium">
                        {t('shifts.callResponsable')}
                      </a>
                    )}
                  </div>
                )}

                {/* Actions */}
                {tab === 'toConfirm' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfirm(shift.id)}
                      className="flex-1 py-2 bg-worker-600 text-white font-medium rounded-lg hover:bg-worker-700 transition-colors text-sm"
                    >
                      {t('shifts.confirm')}
                    </button>
                    <button
                      onClick={() => navigate(`/worker/shifts/${shift.id}`)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded-lg text-sm"
                    >
                      {t('shifts.viewDetail')}
                    </button>
                  </div>
                )}

                {/* Horodateur — confirmed shifts only */}
                {tab === 'confirmed' && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-700">{t('timepunch.title')}</h4>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : shift.id)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? t('common.close') : t('timepunch.history')}
                      </button>
                    </div>

                    {/* Punch buttons */}
                    <div className="flex gap-2">
                      {!active ? (
                        <button
                          onClick={() => handlePunch(shift.id, 'PUNCH_IN')}
                          disabled={punchingId === shift.id}
                          className="flex-1 py-2.5 bg-green-600 text-white font-medium rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {punchingId === shift.id ? t('common.loading') : t('timepunch.punchIn')}
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePunch(shift.id, 'PUNCH_OUT')}
                          disabled={punchingId === shift.id}
                          className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          {punchingId === shift.id ? t('common.loading') : t('timepunch.punchOut')}
                        </button>
                      )}

                      {/* Report button */}
                      <button
                        onClick={() => setReportMissionId(reportMissionId === shift.id ? null : shift.id)}
                        className="px-3 py-2.5 bg-blue-50 text-blue-600 font-medium rounded-lg text-sm hover:bg-blue-100"
                      >
                        {t('reports.write')}
                      </button>
                    </div>

                    {active && (
                      <p className="text-xs text-green-600 mt-1 animate-pulse">
                        {t('timepunch.activeSession')} — {new Date(active.timestamp).toLocaleTimeString('fr-CA')}
                      </p>
                    )}

                    {gpsError && punchingId === null && (
                      <p className="text-xs text-red-500 mt-1">{gpsError}</p>
                    )}

                    {/* Punch history */}
                    {isExpanded && history.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {history.slice(0, 10).map((p) => (
                          <div key={p.id} className="flex items-center gap-2 text-xs text-gray-500">
                            <span className={`w-2 h-2 rounded-full ${p.type === 'PUNCH_IN' ? 'bg-green-400' : 'bg-red-400'}`} />
                            <span className="font-medium">{p.type === 'PUNCH_IN' ? t('timepunch.punchIn') : t('timepunch.punchOut')}</span>
                            <span>{new Date(p.timestamp).toLocaleString('fr-CA')}</span>
                            {!p.isWithinZone && <span className="text-red-500">{t('timepunch.outOfZone')}</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Report form */}
                    {reportMissionId === shift.id && (
                      <div className="mt-3 bg-blue-50 rounded-lg p-3 space-y-2">
                        <textarea
                          value={reportContent}
                          onChange={(e) => setReportContent(e.target.value)}
                          rows={3}
                          placeholder={t('reports.placeholder')}
                          className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSubmitReport(shift.id)}
                            disabled={submittingReport || !reportContent.trim()}
                            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            {submittingReport ? t('common.loading') : t('reports.submit')}
                          </button>
                          <button
                            onClick={() => { setReportMissionId(null); setReportContent(''); }}
                            className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm"
                          >
                            {t('common.cancel')}
                          </button>
                        </div>
                      </div>
                    )}
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
