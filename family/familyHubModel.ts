import type { CartLine } from "../components/cart/cartTypes";
import { loadFamilyCartLines, saveFamilyCartLines } from "./familyCartPersistence";

export { loadFamilyCartLines };

export const FAMILY_UPDATED_EVENT = "momoA-family-updated";

function dispatchFamilyUpdated() {
  window.dispatchEvent(new CustomEvent(FAMILY_UPDATED_EVENT));
}

export type FamilyRole = "mom" | "dad" | "caregiver" | "other";

export type FamilyMember = {
  id: string;
  displayName: string;
  role: FamilyRole;
  status: "active" | "pending";
};

export type FamilyActivity = {
  id: string;
  at: number;
  actorName: string;
  message: string;
};

export type FamilyTodo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

export type FamilyHubState = {
  familyName: string;
  inviteCode: string;
  members: FamilyMember[];
  /** 가족이 같은 쇼핑 흐름을 볼 때(데모 토글) */
  sharedShoppingMode: boolean;
};

const HUB_KEY = "momoA.familyHub.v1";
const ACTIVITY_KEY = "momoA.familyActivity.v1";
const TODO_KEY = "momoA.familyTodo.v1";
const MAX_ACTIVITY = 40;

const DEFAULT_HUB: FamilyHubState = {
  familyName: "우리 집",
  inviteCode: "",
  members: [
    { id: "m_self", displayName: "나 (엄마)", role: "mom", status: "active" },
    { id: "m_dad", displayName: "아빠", role: "dad", status: "pending" },
  ],
  sharedShoppingMode: false,
};

function randomInvite(): string {
  const a = Math.random().toString(36).slice(2, 6).toUpperCase();
  const b = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MOA-${a}-${b}`;
}

function normalizeHub(raw: unknown): FamilyHubState | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const familyName = typeof o.familyName === "string" && o.familyName.trim() ? o.familyName.trim() : DEFAULT_HUB.familyName;
  let inviteCode = typeof o.inviteCode === "string" ? o.inviteCode.trim() : "";
  if (!inviteCode) inviteCode = randomInvite();
  const members = Array.isArray(o.members)
    ? (o.members as unknown[])
        .map((m) => {
          if (!m || typeof m !== "object") return null;
          const x = m as Record<string, unknown>;
          const id = typeof x.id === "string" ? x.id : "";
          const displayName = typeof x.displayName === "string" ? x.displayName : "";
          const role = x.role === "mom" || x.role === "dad" || x.role === "caregiver" || x.role === "other" ? x.role : "other";
          const status = x.status === "pending" ? "pending" : "active";
          if (!id || !displayName) return null;
          return { id, displayName, role, status } as FamilyMember;
        })
        .filter(Boolean) as FamilyMember[]
    : DEFAULT_HUB.members;
  const sharedShoppingMode = o.sharedShoppingMode === true;
  return { familyName, inviteCode, members: members.length ? members : DEFAULT_HUB.members, sharedShoppingMode };
}

export function loadFamilyHub(): FamilyHubState {
  try {
    const raw = localStorage.getItem(HUB_KEY);
    if (!raw) {
      const next = { ...DEFAULT_HUB, inviteCode: randomInvite() };
      saveFamilyHub(next);
      return next;
    }
    const parsed = JSON.parse(raw) as unknown;
    const n = normalizeHub(parsed);
    if (!n) {
      const next = { ...DEFAULT_HUB, inviteCode: randomInvite() };
      saveFamilyHub(next);
      return next;
    }
    return n;
  } catch {
    const next = { ...DEFAULT_HUB, inviteCode: randomInvite() };
    saveFamilyHub(next);
    return next;
  }
}

export function saveFamilyHub(next: FamilyHubState) {
  localStorage.setItem(HUB_KEY, JSON.stringify(next));
  dispatchFamilyUpdated();
}

export function updateFamilyName(name: string) {
  const hub = loadFamilyHub();
  saveFamilyHub({ ...hub, familyName: name.trim() || hub.familyName });
}

export function regenerateInviteCode() {
  const hub = loadFamilyHub();
  saveFamilyHub({ ...hub, inviteCode: randomInvite() });
}

export function setSharedShoppingMode(on: boolean) {
  const hub = loadFamilyHub();
  saveFamilyHub({ ...hub, sharedShoppingMode: on });
  pushFamilyActivity(on ? "가족 쇼핑 모드를 켰어요. 같은 체크리스트로 물건을 고를 수 있어요." : "가족 쇼핑 모드를 껐어요.");
}

export function addFamilyMemberDraft(displayName: string, role: FamilyRole) {
  const hub = loadFamilyHub();
  const id = `m_${Date.now().toString(36)}`;
  saveFamilyHub({
    ...hub,
    members: [...hub.members, { id, displayName: displayName.trim() || "가족", role, status: "pending" }],
  });
  pushFamilyActivity(`${displayName.trim() || "가족"}님을 초대했어요. (수락 대기)`);
}

export function activateMember(id: string) {
  const hub = loadFamilyHub();
  const name = hub.members.find((m) => m.id === id)?.displayName ?? "가족";
  saveFamilyHub({
    ...hub,
    members: hub.members.map((m) => (m.id === id ? { ...m, status: "active" as const } : m)),
  });
  pushFamilyActivity(`${name}님이 우리 가족 공간에 참여했어요.`);
}

export function loadFamilyActivities(): FamilyActivity[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) return seedDefaultActivities();
    const a = JSON.parse(raw) as unknown;
    if (!Array.isArray(a) || a.length === 0) return seedDefaultActivities();
    return a
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const o = x as Record<string, unknown>;
        const id = typeof o.id === "string" ? o.id : "";
        const message = typeof o.message === "string" ? o.message : "";
        const actorName = typeof o.actorName === "string" ? o.actorName : "가족";
        const at = Number(o.at);
        if (!id || !message || !Number.isFinite(at)) return null;
        return { id, at, actorName, message };
      })
      .filter(Boolean) as FamilyActivity[];
  } catch {
    return seedDefaultActivities();
  }
}

function persistActivities(list: FamilyActivity[]) {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(list.slice(0, MAX_ACTIVITY)));
  dispatchFamilyUpdated();
}

function seedDefaultActivities(): FamilyActivity[] {
  const t = Date.now();
  const seed: FamilyActivity[] = [
    {
      id: "fa_seed_1",
      at: t - 3600000,
      actorName: "아빠",
      message: "이번 주 분유 재고 확인해 둘게요.",
    },
    {
      id: "fa_seed_2",
      at: t - 7200000,
      actorName: "나 (엄마)",
      message: "공동 장바구니에 기저귀 1팩 담아 두었어요.",
    },
  ];
  persistActivities(seed);
  return seed;
}

export function pushFamilyActivity(message: string, actorName = "나 (엄마)") {
  const list = loadFamilyActivities();
  const n: FamilyActivity = {
    id: `fa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    at: Date.now(),
    actorName,
    message,
  };
  list.unshift(n);
  persistActivities(list);
}

/** 공동 장바구니 — 줄 단위 CRUD */
export function setFamilyCartLines(lines: CartLine[]) {
  saveFamilyCartLines(lines);
  dispatchFamilyUpdated();
}

export function addOrBumpFamilyCartLine(line: Omit<CartLine, "selected"> & { selected?: boolean }) {
  const prev = loadFamilyCartLines();
  const i = prev.findIndex((l) => l.productId === line.productId);
  let next: CartLine[];
  if (i >= 0) {
    next = [...prev];
    const cur = next[i];
    next[i] = {
      ...cur,
      quantity: Math.min(99, cur.quantity + line.quantity),
      name: line.name || cur.name,
      imageUrl: line.imageUrl || cur.imageUrl,
      priceLabel: line.priceLabel || cur.priceLabel,
      unitWon: line.unitWon || cur.unitWon,
    };
  } else {
    next = [
      ...prev,
      {
        productId: line.productId,
        name: line.name,
        imageUrl: line.imageUrl,
        priceLabel: line.priceLabel,
        unitWon: line.unitWon,
        quantity: line.quantity,
        selected: line.selected !== false,
      },
    ];
  }
  saveFamilyCartLines(next);
  dispatchFamilyUpdated();
}

export function setFamilyLineQuantity(productId: number, quantity: number) {
  const q = Math.max(1, Math.min(99, Math.floor(quantity)));
  const next = loadFamilyCartLines().map((l) => (l.productId === productId ? { ...l, quantity: q } : l));
  saveFamilyCartLines(next);
  dispatchFamilyUpdated();
}

export function removeFamilyCartLine(productId: number) {
  const next = loadFamilyCartLines().filter((l) => l.productId !== productId);
  saveFamilyCartLines(next);
  dispatchFamilyUpdated();
}

export function clearFamilyCart() {
  saveFamilyCartLines([]);
  dispatchFamilyUpdated();
}

function seedDefaultTodos(): FamilyTodo[] {
  const now = Date.now();
  const list: FamilyTodo[] = [
    {
      id: "ft_seed_1",
      text: "이번 주 기저귀 재고 확인",
      done: false,
      createdAt: now - 1000 * 60 * 90,
    },
    {
      id: "ft_seed_2",
      text: "외출용 물티슈 리필 준비",
      done: true,
      createdAt: now - 1000 * 60 * 60 * 8,
    },
  ];
  localStorage.setItem(TODO_KEY, JSON.stringify(list));
  return list;
}

export function loadFamilyTodos(): FamilyTodo[] {
  try {
    const raw = localStorage.getItem(TODO_KEY);
    if (!raw) return seedDefaultTodos();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return seedDefaultTodos();
    const list = parsed
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const o = x as Record<string, unknown>;
        const id = typeof o.id === "string" ? o.id : "";
        const text = typeof o.text === "string" ? o.text.trim() : "";
        const done = o.done === true;
        const createdAt = Number(o.createdAt);
        if (!id || !text || !Number.isFinite(createdAt)) return null;
        return { id, text, done, createdAt } as FamilyTodo;
      })
      .filter(Boolean) as FamilyTodo[];
    if (list.length === 0) return seedDefaultTodos();
    return list;
  } catch {
    return seedDefaultTodos();
  }
}

function saveFamilyTodos(next: FamilyTodo[]) {
  localStorage.setItem(TODO_KEY, JSON.stringify(next.slice(0, 30)));
  dispatchFamilyUpdated();
}

export function addFamilyTodo(text: string) {
  const t = text.trim();
  if (!t) return;
  const next: FamilyTodo = {
    id: `ft_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    text: t,
    done: false,
    createdAt: Date.now(),
  };
  saveFamilyTodos([next, ...loadFamilyTodos()]);
  pushFamilyActivity(`가족 체크리스트에 「${t}」 항목을 추가했어요.`);
}

export function toggleFamilyTodo(id: string) {
  const list = loadFamilyTodos();
  const target = list.find((t) => t.id === id);
  if (!target) return;
  const next = list.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  saveFamilyTodos(next);
  pushFamilyActivity(
    target.done
      ? `체크리스트 「${target.text}」을(를) 다시 진행 중으로 바꿨어요.`
      : `체크리스트 「${target.text}」을(를) 완료했어요.`
  );
}

export function removeFamilyTodo(id: string) {
  const list = loadFamilyTodos();
  const target = list.find((t) => t.id === id);
  const next = list.filter((t) => t.id !== id);
  saveFamilyTodos(next);
  if (target) pushFamilyActivity(`체크리스트 「${target.text}」 항목을 삭제했어요.`);
}
