import { useMemo, useState, useSyncExternalStore } from "react";
import { useOptionalCartScreen } from "./cart/CartScreenContext";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "새 리뷰가 등록됐어요",
    body: "관심 제품에 새로운 리뷰가 올라왔어요. 확인해보세요.",
    createdAt: "방금",
    read: false,
  },
  {
    id: "n2",
    title: "모모아 바우처 혜택 안내",
    body: "이번 주 바우처 미션이 업데이트 되었어요.",
    createdAt: "1시간 전",
    read: false,
  },
  {
    id: "n3",
    title: "인기 급상승 제품",
    body: "이번 주 가장 많이 본 제품을 확인해보세요.",
    createdAt: "어제",
    read: true,
  },
];

let sharedNotifications: NotificationItem[] = DEFAULT_NOTIFICATIONS;
const notifListeners = new Set<() => void>();

function subscribeNotifs(cb: () => void) {
  notifListeners.add(cb);
  return () => notifListeners.delete(cb);
}

function getNotifSnapshot() {
  return sharedNotifications;
}

function setSharedNotifications(
  updater: NotificationItem[] | ((prev: NotificationItem[]) => NotificationItem[])
) {
  sharedNotifications =
    typeof updater === "function"
      ? (updater as (p: NotificationItem[]) => NotificationItem[])(sharedNotifications)
      : updater;
  notifListeners.forEach((l) => l());
}

const brandDisplayStyle = {
  fontFamily: '"GeekbleMalang2", "MOMOA UI", system-ui, sans-serif',
} as const;

function CartTopButton() {
  const cart = useOptionalCartScreen();
  const count = cart?.itemCount ?? 0;
  return (
    <button
      type="button"
      onClick={() => cart?.openCart() ?? window.alert("장바구니(데모)")}
      className="relative z-[1] inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_4px_20px_-4px_rgba(255,133,62,0.18)] ring-1 ring-[#FFD2BF]/70 transition hover:bg-[#FFFCF9]"
      aria-label="장바구니"
    >
      <span className="flex h-full w-full items-center justify-center text-lg leading-none">🛒</span>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-[#FF853E] px-1 text-[10px] font-extrabold tabular-nums leading-none text-white ring-2 ring-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

type MainScreenTopBarProps = {
  /** false면 MOMOA 로고 숨김(알림·장바구니만). 기본 true — 육아용품·홈 등 동일 상단바 */
  showBrandMark?: boolean;
};

/**
 * 왼쪽 MOMOA 로고 · 알림 · 장바구니
 * 동네·위치 기반 설정은 커뮤니티 탭(`NeighborhoodLocationControl`)에서만 제공합니다.
 */
export default function MainScreenTopBar({ showBrandMark = true }: MainScreenTopBarProps) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState<"all" | "unread" | "read">("all");
  const notifications = useSyncExternalStore(subscribeNotifs, getNotifSnapshot, getNotifSnapshot);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (notificationTab === "unread") return !n.read;
      if (notificationTab === "read") return n.read;
      return true;
    });
  }, [notifications, notificationTab]);

  return (
    <>
      <header className="mb-1.5 pt-[env(safe-area-inset-top,0px)]">
        <div className="flex w-full items-center py-0.5">
          {showBrandMark ? (
            <div className="flex min-h-10 w-full items-center justify-between gap-3">
              <p
                className="min-w-0 shrink whitespace-nowrap text-left text-lg font-bold leading-none tracking-tight text-[#FF853E] antialiased sm:text-xl"
                style={brandDisplayStyle}
              >
                MOMOA
              </p>

              <div className="relative z-[1] flex shrink-0 items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationOpen(true);
                    setNotificationTab("all");
                  }}
                  className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_4px_20px_-4px_rgba(255,133,62,0.18)] ring-1 ring-[#FFD2BF]/70 transition hover:bg-[#FFFCF9]"
                  aria-label="알림"
                >
                  <span className="flex h-full w-full items-center justify-center text-lg leading-none">
                    🔔
                  </span>
                  {unreadCount > 0 && (
                    <span
                      className="absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full bg-[#FF853E] ring-2 ring-white"
                      aria-hidden="true"
                    />
                  )}
                </button>
                <CartTopButton />
              </div>
            </div>
          ) : (
            <div className="flex min-h-10 w-full items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setNotificationOpen(true);
                  setNotificationTab("all");
                }}
                className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_4px_20px_-4px_rgba(255,133,62,0.18)] ring-1 ring-[#FFD2BF]/70 transition hover:bg-[#FFFCF9]"
                aria-label="알림"
              >
                <span className="flex h-full w-full items-center justify-center text-lg leading-none">
                  🔔
                </span>
                {unreadCount > 0 && (
                  <span
                    className="absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full bg-[#FF853E] ring-2 ring-white"
                    aria-hidden="true"
                  />
                )}
              </button>
              <CartTopButton />
            </div>
          )}
        </div>
      </header>

      {notificationOpen && (
        <div className="app-viewport-fixed z-50 bg-black/40">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="닫기"
            onClick={() => setNotificationOpen(false)}
          />
          <div className="absolute left-1/2 top-24 z-[51] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500">알림</p>
                <p className="text-sm font-extrabold text-slate-900">
                  {unreadCount > 0 ? `안읽음 ${unreadCount}개` : "새 알림이 없어요"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotificationOpen(false)}
                className="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 px-5 py-3">
              <button
                type="button"
                onClick={() => setNotificationTab("all")}
                className={`rounded-2xl px-4 py-2 text-xs font-extrabold transition ${
                  notificationTab === "all"
                    ? "bg-[#FFF1EA] text-[#FF853E]"
                    : "bg-slate-100 text-[#FF853E] hover:bg-slate-200"
                }`}
              >
                전체
              </button>
              <button
                type="button"
                onClick={() => setNotificationTab("unread")}
                className={`rounded-2xl px-4 py-2 text-xs font-extrabold transition ${
                  notificationTab === "unread"
                    ? "bg-[#FFF1EA] text-[#FF853E]"
                    : "bg-slate-100 text-[#FF853E] hover:bg-slate-200"
                }`}
              >
                안읽음
              </button>
              <button
                type="button"
                onClick={() => setNotificationTab("read")}
                className={`rounded-2xl px-4 py-2 text-xs font-extrabold transition ${
                  notificationTab === "read"
                    ? "bg-[#FFF1EA] text-[#FF853E]"
                    : "bg-slate-100 text-[#FF853E] hover:bg-slate-200"
                }`}
              >
                읽음
              </button>
            </div>

            <div className="max-h-[60dvh] overflow-y-auto px-2 pb-3">
              {filteredNotifications.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm font-semibold text-slate-500">
                    {notificationTab === "all"
                      ? "알림이 없어요"
                      : notificationTab === "unread"
                        ? "안읽은 알림이 없어요"
                        : "읽은 알림이 없어요"}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      setSharedNotifications((prev) =>
                        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
                      );
                    }}
                    className={`w-full rounded-3xl px-4 py-4 text-left transition hover:bg-slate-50 ${
                      n.read ? "opacity-80" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold leading-snug text-slate-900 line-clamp-2">
                          {!n.read && (
                            <span
                              className="mr-2 inline-flex h-2 w-2 rounded-full bg-[#FF853E] align-middle"
                              aria-hidden="true"
                            />
                          )}
                          {n.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-600">
                          {n.body}
                        </p>
                      </div>
                      <p className="shrink-0 text-[11px] font-semibold text-slate-400">
                        {n.createdAt}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
