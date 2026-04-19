import { useEffect, useState } from "react";
import {
  loadInAppNotifications,
  markAllInAppNotificationsRead,
  markInAppNotificationRead,
  NOTIFICATION_INBOX_EVENT,
  type InAppNotification,
} from "../settings/inAppNotifications";

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function NotificationInboxPage({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<InAppNotification[]>(() => loadInAppNotifications());

  useEffect(() => {
    const sync = () => setItems(loadInAppNotifications());
    window.addEventListener(NOTIFICATION_INBOX_EVENT, sync);
    return () => window.removeEventListener(NOTIFICATION_INBOX_EVENT, sync);
  }, []);

  return (
    <div className="min-h-dvh bg-white pb-safe-tab">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white">
        <div className="relative flex items-center justify-center px-4 py-4">
          <button
            type="button"
            onClick={onBack}
            className="absolute left-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-700 hover:bg-slate-100"
            aria-label="뒤로"
          >
            ←
          </button>
          <h1 className="text-lg font-bold text-slate-900">알림</h1>
          <button
            type="button"
            onClick={() => {
              markAllInAppNotificationsRead();
              setItems(loadInAppNotifications());
            }}
            className="absolute right-3 text-xs font-semibold text-[#FF853E]"
          >
            모두 읽음
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-4">
        {items.length === 0 ? (
          <p className="py-16 text-center text-sm font-medium text-slate-500">알림이 없어요.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    markInAppNotificationRead(n.id);
                    setItems(loadInAppNotifications());
                  }}
                  className={`w-full rounded-2xl border px-4 py-3.5 text-left transition ${
                    n.read
                      ? "border-slate-100 bg-slate-50/80"
                      : "border-[#FFD2BF]/60 bg-[#FFF8F4]/90 ring-1 ring-[#FFD2BF]/40"
                  }`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    {n.kind === "order"
                      ? "주문"
                      : n.kind === "promo"
                        ? "혜택"
                        : n.kind === "community"
                          ? "커뮤니티"
                          : "안내"}
                    <span className="mx-1.5 font-normal text-slate-300">·</span>
                    {formatTime(n.createdAt)}
                  </p>
                  <p className="mt-1 text-[15px] font-bold text-slate-900">{n.title}</p>
                  <p className="mt-1 text-[13px] font-medium leading-relaxed text-slate-600">{n.body}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
