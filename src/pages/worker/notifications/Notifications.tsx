import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { notificationsApi } from '../../../services/api';
import { useNotificationStore } from '../../../stores/notificationStore';
import { NotificationItem } from '../../../types/worker';

export default function Notifications() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { loadUnreadCount } = useNotificationStore();

  useEffect(() => {
    notificationsApi.list()
      .then((data) => setNotifications(data.notifications as NotificationItem[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      loadUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'SHIFT_REMINDER': return '⏰';
      case 'SHIFT_CONFIRMED': return '✅';
      case 'SHIFT_CANCELLED': return '❌';
      case 'TIME_APPROVED': return '💰';
      case 'SHIFT_UPDATED': return '🔄';
      default: return '🔔';
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      <h1 className="text-xl font-bold text-gray-900 mb-4">{t('notifications.title')}</h1>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">{t('notifications.noNotifications')}</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const timeAgo = new Date(notif.createdAt).toLocaleDateString('fr-CA', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={notif.id}
                className={`bg-white rounded-xl shadow-sm border p-4 ${
                  notif.isRead ? 'border-gray-100' : 'border-worker-200 bg-worker-50/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{typeIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-semibold ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{timeAgo}</span>
                    </div>
                    <p className="text-sm text-gray-500">{notif.body}</p>
                    {notif.mission && (
                      <p className="text-xs text-gray-400 mt-1">
                        {notif.mission.reference || notif.mission.title}
                      </p>
                    )}
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="mt-2 text-xs text-worker-600 font-medium hover:underline"
                      >
                        {t('notifications.markAsRead')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
