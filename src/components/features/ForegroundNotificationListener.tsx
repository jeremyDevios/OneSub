"use client";
import { useEffect, useState } from 'react';
import { onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import { Bell, X } from 'lucide-react';

export function ForegroundNotificationListener() {
  const [notification, setNotification] = useState<{title: string, body: string} | null>(null);

  useEffect(() => {
    // messaging can be null during SSR or if not supported
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground Message received: ', payload);
      const title = payload.notification?.title || 'Notification';
      const body = payload.notification?.body || '';

      setNotification({ title, body });
      
      // Also show native notification if possible (and not focused)
      if (Notification.permission === 'granted' && document.hidden) {
          new Notification(title, {
              body,
              icon: '/icon-192x192.png'
          });
      }
      
      // Auto hide toast after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] max-w-md w-full bg-zinc-900 border border-zinc-700 shadow-2xl rounded-xl p-4 flex gap-4 animate-in slide-in-from-top-5 fade-in duration-300">
        <div className="bg-orange-500/20 p-3 rounded-full h-fit text-orange-500 shrink-0">
             <Bell className="w-6 h-6" />
        </div>
        <div className="flex-1">
            <h4 className="font-bold text-white text-base">{notification.title}</h4>
            <p className="text-zinc-300 text-sm mt-1 leading-relaxed">{notification.body}</p>
        </div>
        <button onClick={() => setNotification(null)} className="text-zinc-500 hover:text-white shrink-0 -mt-1 -mr-1 p-2">
            <X className="w-5 h-5" />
        </button>
    </div>
  );
}
