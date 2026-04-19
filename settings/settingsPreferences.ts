export type NotificationPreferences = {
  /** 전체 알림 허용 */
  masterEnabled: boolean;
  /** 주문·배송 */
  orderShipping: boolean;
  /** 프로모션·혜택 */
  promotion: boolean;
  /** 커뮤니티·댓글 */
  community: boolean;
  /** 상담·맞춤 추천 */
  consultation: boolean;
  /** 야간 시간 알림 줄이기 */
  nightQuietEnabled: boolean;
  /** HH:mm 로컬 */
  quietStart: string;
  quietEnd: string;
};

const KEY = "momoA.notificationSettings";

const DEFAULTS: NotificationPreferences = {
  masterEnabled: true,
  orderShipping: true,
  promotion: true,
  community: true,
  consultation: true,
  nightQuietEnabled: false,
  quietStart: "22:00",
  quietEnd: "08:00",
};

export function loadNotificationPreferences(): NotificationPreferences {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const o = JSON.parse(raw) as Partial<NotificationPreferences>;
    return {
      ...DEFAULTS,
      ...o,
      masterEnabled: typeof o.masterEnabled === "boolean" ? o.masterEnabled : DEFAULTS.masterEnabled,
      orderShipping: typeof o.orderShipping === "boolean" ? o.orderShipping : DEFAULTS.orderShipping,
      promotion: typeof o.promotion === "boolean" ? o.promotion : DEFAULTS.promotion,
      community: typeof o.community === "boolean" ? o.community : DEFAULTS.community,
      consultation: typeof o.consultation === "boolean" ? o.consultation : DEFAULTS.consultation,
      nightQuietEnabled:
        typeof o.nightQuietEnabled === "boolean" ? o.nightQuietEnabled : DEFAULTS.nightQuietEnabled,
      quietStart: typeof o.quietStart === "string" ? o.quietStart : DEFAULTS.quietStart,
      quietEnd: typeof o.quietEnd === "string" ? o.quietEnd : DEFAULTS.quietEnd,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveNotificationPreferences(next: NotificationPreferences) {
  localStorage.setItem(KEY, JSON.stringify(next));
}
