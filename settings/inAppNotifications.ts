export type InAppNotificationKind = "system" | "order" | "promo" | "community";

export type InAppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  kind: InAppNotificationKind;
};

const KEY = "momoA.inAppNotifications";
const MAX = 80;

export const NOTIFICATION_INBOX_EVENT = "momoA-inapp-notifications";

function dispatch() {
  window.dispatchEvent(new CustomEvent(NOTIFICATION_INBOX_EVENT));
}

function persist(list: InAppNotification[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  dispatch();
}

function defaultSeed(): InAppNotification[] {
  const t = Date.now();
  return [
    {
      id: "n_welcome",
      title: "모모아에 오신 걸 환영해요",
      body: "육아용품 스크랩과 맞춤 상담을 이용해 보세요. 알림은 설정에서 끄거나 줄일 수 있어요.",
      createdAt: t - 86400000,
      read: false,
      kind: "system",
    },
  ];
}

export function loadInAppNotifications(): InAppNotification[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const seed = defaultSeed();
      persist(seed);
      return seed;
    }
    const a = JSON.parse(raw) as unknown;
    if (!Array.isArray(a) || a.length === 0) {
      const seed = defaultSeed();
      persist(seed);
      return seed;
    }
    return a.filter((x) => x && typeof x === "object") as InAppNotification[];
  } catch {
    const seed = defaultSeed();
    persist(seed);
    return seed;
  }
}

export function addInAppNotification(
  entry: Omit<InAppNotification, "id" | "createdAt" | "read">
): InAppNotification {
  const list = loadInAppNotifications();
  const n: InAppNotification = {
    ...entry,
    id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    read: false,
  };
  list.unshift(n);
  persist(list);
  return n;
}

export function markInAppNotificationRead(id: string) {
  const list = loadInAppNotifications().map((x) => (x.id === id ? { ...x, read: true } : x));
  persist(list);
}

export function markAllInAppNotificationsRead() {
  const list = loadInAppNotifications().map((x) => ({ ...x, read: true }));
  persist(list);
}

export function unreadInAppNotificationCount(): number {
  return loadInAppNotifications().filter((x) => !x.read).length;
}
