import { useCallback, useEffect, useMemo, useState } from "react";
import MainScreenTopBar from "../MainScreenTopBar";
import { useCartScreen } from "../cart/CartScreenContext";
import { parseGearPriceToWon } from "../../profile/gearIncomeRecommendation";
import type { CartLine, CartProductInput } from "../cart/cartTypes";
import {
  addFamilyTodo,
  activateMember,
  addFamilyMemberDraft,
  addOrBumpFamilyCartLine,
  clearFamilyCart,
  FAMILY_UPDATED_EVENT,
  loadFamilyActivities,
  loadFamilyCartLines,
  loadFamilyHub,
  loadFamilyTodos,
  pushFamilyActivity,
  regenerateInviteCode,
  removeFamilyTodo,
  removeFamilyCartLine,
  setFamilyLineQuantity,
  setSharedShoppingMode,
  toggleFamilyTodo,
  updateFamilyName,
  type FamilyActivity,
  type FamilyHubState,
  type FamilyMember,
  type FamilyRole,
  type FamilyTodo,
} from "../../family/familyHubModel";
import { MAIN_TAB_EVENT } from "../home/MetricCoachModal";

type FamilyTop = "account" | "cart" | "shop";

const ROLE_LABEL: Record<FamilyRole, string> = {
  mom: "엄마",
  dad: "아빠",
  caregiver: "보호자",
  other: "가족",
};

const DEMO_SUGGESTIONS: CartProductInput[] = [
  {
    id: 501,
    name: "신생아 순면 바디수트 세트",
    price: "29,800원",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&h=200&fit=crop",
  },
  {
    id: 502,
    name: "젖병 소독기 (UV·건조)",
    price: "89,000원",
    imageUrl: "https://images.unsplash.com/photo-1584530041111-0e8e0c0d0b0b?w=200&h=200&fit=crop",
  },
];

export default function FamilyHubScreen() {
  const { addToCart, openCart } = useCartScreen();
  const [top, setTop] = useState<FamilyTop>("account");
  const [hub, setHub] = useState<FamilyHubState>(() => loadFamilyHub());
  const [activities, setActivities] = useState<FamilyActivity[]>(() => loadFamilyActivities());
  const [familyCart, setFamilyCart] = useState(() => loadFamilyCartLines());
  const [todos, setTodos] = useState<FamilyTodo[]>(() => loadFamilyTodos());
  const [nameDraft, setNameDraft] = useState(() => loadFamilyHub().familyName);
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<FamilyRole>("dad");
  const [todoDraft, setTodoDraft] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const syncAll = useCallback(() => {
    setHub(loadFamilyHub());
    setActivities(loadFamilyActivities());
    setFamilyCart(loadFamilyCartLines());
    setTodos(loadFamilyTodos());
  }, []);

  useEffect(() => {
    const h = () => syncAll();
    window.addEventListener(FAMILY_UPDATED_EVENT, h);
    return () => window.removeEventListener(FAMILY_UPDATED_EVENT, h);
  }, [syncAll]);

  useEffect(() => {
    setNameDraft(hub.familyName);
  }, [hub.familyName]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const copyInvite = useCallback(() => {
    void navigator.clipboard?.writeText(hub.inviteCode).then(
      () => showToast("초대 코드를 복사했어요."),
      () => showToast("코드를 길게 눌러 복사해 주세요.")
    );
  }, [hub.inviteCode, showToast]);

  const persistName = useCallback(() => {
    updateFamilyName(nameDraft);
    showToast("가족 이름을 저장했어요.");
  }, [nameDraft, showToast]);

  const familySubtotal = useMemo(
    () => familyCart.reduce((s: number, l: CartLine) => s + l.unitWon * l.quantity, 0),
    [familyCart]
  );

  const mergeLineToPersonal = useCallback(
    (productId: number) => {
      const line = familyCart.find((l) => l.productId === productId);
      if (!line) return;
      const product: CartProductInput = {
        id: line.productId,
        name: line.name,
        price: `${line.priceLabel}원`,
        imageUrl: line.imageUrl,
      };
      for (let i = 0; i < line.quantity; i += 1) {
        addToCart(product);
      }
      removeFamilyCartLine(productId);
      pushFamilyActivity(`「${line.name}」을(를) 내 장바구니로 옮겼어요.`);
      syncAll();
      showToast("내 장바구니에 담았어요.");
    },
    [addToCart, familyCart, showToast, syncAll]
  );

  const mergeAllToPersonal = useCallback(() => {
    if (familyCart.length === 0) return;
    const snapshot = [...familyCart];
    for (const line of snapshot) {
      const product: CartProductInput = {
        id: line.productId,
        name: line.name,
        price: `${line.priceLabel}원`,
        imageUrl: line.imageUrl,
      };
      for (let i = 0; i < line.quantity; i += 1) {
        addToCart(product);
      }
    }
    const n = snapshot.length;
    clearFamilyCart();
    pushFamilyActivity(`공동 장바구니 ${n}종을 내 장바구니로 한 번에 옮겼어요.`);
    syncAll();
    showToast("모두 내 장바구니에 담았어요.");
  }, [addToCart, familyCart, showToast, syncAll]);

  const addDemoToFamilyCart = useCallback(
    (p: CartProductInput) => {
      const unitWon = parseGearPriceToWon(p.price);
      const priceLabel = p.price.replace(/\s/g, "").replace(/원/g, "");
      addOrBumpFamilyCartLine({
        productId: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        priceLabel,
        unitWon,
        quantity: 1,
      });
      pushFamilyActivity(`「${p.name}」을(를) 가족 장바구니에 담았어요.`);
      syncAll();
      showToast("가족 장바구니에 담았어요.");
    },
    [showToast, syncAll]
  );

  const tabs: { key: FamilyTop; label: string }[] = [
    { key: "account", label: "가족 계정" },
    { key: "cart", label: "공동 장바구니" },
    { key: "shop", label: "함께 쇼핑" },
  ];

  return (
    <div className="flex min-h-dvh flex-col font-sans">
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <MainScreenTopBar />
      </div>

      <div className="px-5 sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-sky-600">MOMOA 패밀리</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">가족과 함께하는 쇼핑</h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          한 공간에서 초대하고, 공동 장바구니로 필요한 것만 모아 결정해요.
        </p>
      </div>

      <div className="mt-4 px-5 sm:px-6">
        <div className="flex rounded-2xl border border-slate-200/90 bg-slate-50/80 p-1 shadow-inner">
          {tabs.map((t) => {
            const on = top === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTop(t.key)}
                className={`flex-1 rounded-xl px-2 py-2.5 text-center text-[12px] font-bold transition sm:text-[13px] ${
                  on ? "bg-white text-[#FF853E] shadow-sm ring-1 ring-orange-100" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-5 px-5 pb-safe-tab sm:px-6">
        {top === "account" && (
          <FamilyAccountPanel
            hub={hub}
            nameDraft={nameDraft}
            setNameDraft={setNameDraft}
            persistName={persistName}
            copyInvite={copyInvite}
            onRegenerateInvite={() => {
              regenerateInviteCode();
              syncAll();
              showToast("새 초대 코드를 만들었어요.");
            }}
            inviteName={inviteName}
            setInviteName={setInviteName}
            inviteRole={inviteRole}
            setInviteRole={setInviteRole}
            onInvite={() => {
              if (!inviteName.trim()) {
                showToast("이름을 입력해 주세요.");
                return;
              }
              addFamilyMemberDraft(inviteName.trim(), inviteRole);
              setInviteName("");
              syncAll();
              showToast("초대를 보냈어요. (데모)");
            }}
            onActivate={(id) => {
              activateMember(id);
              syncAll();
            }}
          />
        )}

        {top === "cart" && (
          <FamilySharedCartPanel
            lines={familyCart}
            subtotal={familySubtotal}
            onQty={(id, q) => {
              setFamilyLineQuantity(id, q);
              syncAll();
            }}
            onRemove={(id) => {
              removeFamilyCartLine(id);
              syncAll();
            }}
            onMergeOne={mergeLineToPersonal}
            onMergeAll={mergeAllToPersonal}
            onOpenPersonalCart={() => openCart()}
            onGoGear={() => window.dispatchEvent(new CustomEvent(MAIN_TAB_EVENT, { detail: { tab: "gear" } }))}
            onAddDemo={addDemoToFamilyCart}
          />
        )}

        {top === "shop" && (
          <FamilyShopTogetherPanel
            hub={hub}
            activities={activities}
            todos={todos}
            todoDraft={todoDraft}
            setTodoDraft={setTodoDraft}
            onToggleMode={(v) => {
              setSharedShoppingMode(v);
              syncAll();
            }}
            onGoGear={() => window.dispatchEvent(new CustomEvent(MAIN_TAB_EVENT, { detail: { tab: "gear" } }))}
            onNotify={() => {
              pushFamilyActivity("「지금 장보기 할까요?」알림을 보냈어요. (데모)");
              syncAll();
              showToast("가족에게 알림을 보냈어요. (데모)");
            }}
            onAddTodo={() => {
              if (!todoDraft.trim()) {
                showToast("체크리스트 내용을 입력해 주세요.");
                return;
              }
              addFamilyTodo(todoDraft);
              setTodoDraft("");
              syncAll();
              showToast("체크리스트에 추가했어요.");
            }}
            onToggleTodo={(id) => {
              toggleFamilyTodo(id);
              syncAll();
            }}
            onRemoveTodo={(id) => {
              removeFamilyTodo(id);
              syncAll();
              showToast("체크리스트 항목을 삭제했어요.");
            }}
          />
        )}
      </div>

      {toast && (
        <div className="app-bottom-fixed z-[55] flex justify-center px-4 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pointer-events-none">
          <p className="pointer-events-auto rounded-full bg-slate-900/90 px-4 py-2.5 text-center text-[13px] font-semibold text-white shadow-lg">
            {toast}
          </p>
        </div>
      )}
    </div>
  );
}

function FamilyAccountPanel({
  hub,
  nameDraft,
  setNameDraft,
  persistName,
  copyInvite,
  onRegenerateInvite,
  inviteName,
  setInviteName,
  inviteRole,
  setInviteRole,
  onInvite,
  onActivate,
}: {
  hub: FamilyHubState;
  nameDraft: string;
  setNameDraft: (v: string) => void;
  persistName: () => void;
  copyInvite: () => void;
  onRegenerateInvite: () => void;
  inviteName: string;
  setInviteName: (v: string) => void;
  inviteRole: FamilyRole;
  setInviteRole: (v: FamilyRole) => void;
  onInvite: () => void;
  onActivate: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <section className="card-soft p-5">
        <h2 className="text-base font-bold text-slate-900">우리 가족 공간</h2>
        <p className="mt-1 text-xs font-medium text-slate-500">이름은 홈·패밀리 화면에 같이 쓰여요.</p>
        <label className="mt-4 block text-[11px] font-bold uppercase tracking-wide text-slate-400">가족 이름</label>
        <div className="mt-1.5 flex gap-2">
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none ring-1 ring-slate-100 focus:border-[#FFB089] focus:ring-2 focus:ring-[#FF853E]/25"
            placeholder="예: 하늘이네"
          />
          <button
            type="button"
            onClick={persistName}
            className="shrink-0 rounded-xl bg-[#FF853E] px-4 py-2.5 text-sm font-bold text-white shadow-sm"
          >
            저장
          </button>
        </div>
      </section>

      <section className="card-soft p-5">
        <h2 className="text-base font-bold text-slate-900">초대 코드</h2>
        <p className="mt-1 text-xs font-medium text-slate-500">가족 앱에 코드를 입력하면 같은 공간에 모여요. (실서비스 연동 전 데모)</p>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-sky-200/90 bg-sky-50/60 px-4 py-3">
          <code className="text-lg font-bold tracking-widest text-sky-900">{hub.inviteCode}</code>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={copyInvite}
              className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-sky-800 shadow-sm ring-1 ring-sky-100"
            >
              복사
            </button>
            <button
              type="button"
              onClick={onRegenerateInvite}
              className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white shadow-sm"
            >
              새 코드
            </button>
          </div>
        </div>
      </section>

      <section className="card-soft p-5">
        <h2 className="text-base font-bold text-slate-900">가족 구성원</h2>
        <ul className="mt-4 space-y-3">
          {hub.members.map((m: FamilyMember) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{m.displayName}</p>
                <p className="text-[11px] font-medium text-slate-500">
                  {ROLE_LABEL[m.role]}
                  {m.status === "pending" ? " · 초대 중" : " · 참여 중"}
                </p>
              </div>
              {m.status === "pending" && (
                <button
                  type="button"
                  onClick={() => onActivate(m.id)}
                  className="shrink-0 rounded-full border border-[#FFD2BF] bg-[#FFF8F4] px-3 py-1.5 text-[11px] font-bold text-[#C2410C]"
                >
                  수락(데모)
                </button>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <p className="text-xs font-bold text-slate-700">가족 초대하기</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="이름"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#FFB089] focus:ring-2 focus:ring-[#FF853E]/20"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as FamilyRole)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
            >
              <option value="dad">아빠</option>
              <option value="mom">엄마</option>
              <option value="caregiver">보호자</option>
              <option value="other">가족</option>
            </select>
            <button
              type="button"
              onClick={onInvite}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm sm:shrink-0"
            >
              초대
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FamilySharedCartPanel({
  lines,
  subtotal,
  onQty,
  onRemove,
  onMergeOne,
  onMergeAll,
  onOpenPersonalCart,
  onGoGear,
  onAddDemo,
}: {
  lines: CartLine[];
  subtotal: number;
  onQty: (id: number, q: number) => void;
  onRemove: (id: number) => void;
  onMergeOne: (id: number) => void;
  onMergeAll: () => void;
  onOpenPersonalCart: () => void;
  onGoGear: () => void;
  onAddDemo: (p: CartProductInput) => void;
}) {
  return (
    <div className="space-y-4">
      <section className="card-soft p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">공동 장바구니</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">가족이 함께 담은 목록이에요. 결제 전에 내 장바구니로 옮길 수 있어요.</p>
          </div>
          <p className="text-sm font-bold text-[#FF853E]">{subtotal.toLocaleString("ko-KR")}원</p>
        </div>

        {lines.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-10 text-center text-sm font-medium text-slate-500">
            아직 담긴 상품이 없어요. 아래 추천을 담거나 육아용품 탭에서 담아 보세요.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {lines.map((l) => (
              <li key={l.productId} className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                  <img src={l.imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-bold text-slate-900">{l.name}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {l.priceLabel}원 · 합 {(l.unitWon * l.quantity).toLocaleString("ko-KR")}원
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={l.quantity}
                      onChange={(e) => onQty(l.productId, Number(e.target.value))}
                      className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-sm font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => onMergeOne(l.productId)}
                      className="rounded-lg bg-[#FFF1EA] px-2.5 py-1 text-[11px] font-bold text-[#C2410C]"
                    >
                      내 장바구니로
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(l.productId)}
                      className="text-[11px] font-semibold text-slate-400 underline"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={lines.length === 0}
            onClick={onMergeAll}
            className="flex-1 rounded-2xl bg-[#FF853E] py-3 text-sm font-bold text-white shadow-md disabled:opacity-40"
          >
            전부 내 장바구니로
          </button>
          <button
            type="button"
            onClick={onOpenPersonalCart}
            className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-800 shadow-sm"
          >
            내 장바구니 열기
          </button>
        </div>
      </section>

      <section className="card-soft p-5">
        <h3 className="text-sm font-bold text-slate-900">가족이 자주 담는 후보 (데모)</h3>
        <p className="mt-1 text-xs text-slate-500">탭하면 공동 장바구니에 바로 담아요.</p>
        <ul className="mt-3 space-y-2">
          {DEMO_SUGGESTIONS.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onAddDemo(p)}
                className="flex w-full items-center gap-3 rounded-2xl border border-orange-100/80 bg-[#FFFCF9] p-3 text-left transition hover:border-[#FFB089]"
              >
                <img src={p.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                <span className="min-w-0 flex-1 text-sm font-bold text-slate-800">{p.name}</span>
                <span className="shrink-0 text-xs font-bold text-[#FF853E]">담기</span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onGoGear}
          className="mt-4 w-full rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-700"
        >
          육아용품 탭에서 더 담기
        </button>
      </section>
    </div>
  );
}

function FamilyShopTogetherPanel({
  hub,
  activities,
  todos,
  todoDraft,
  setTodoDraft,
  onToggleMode,
  onGoGear,
  onNotify,
  onAddTodo,
  onToggleTodo,
  onRemoveTodo,
}: {
  hub: FamilyHubState;
  activities: FamilyActivity[];
  todos: FamilyTodo[];
  todoDraft: string;
  setTodoDraft: (v: string) => void;
  onToggleMode: (v: boolean) => void;
  onGoGear: () => void;
  onNotify: () => void;
  onAddTodo: () => void;
  onToggleTodo: (id: string) => void;
  onRemoveTodo: (id: string) => void;
}) {
  const doneCount = todos.filter((t) => t.done).length;
  return (
    <div className="space-y-4">
      <section className="card-soft p-5">
        <h2 className="text-base font-bold text-slate-900">함께 쇼핑하기</h2>
        <p className="mt-1 text-xs font-medium text-slate-500">
          같은 체크리스트와 알림으로 가족이 한 흐름으로 물건을 고를 수 있어요. (연동 전 로컬 데모)
        </p>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-sm font-bold text-slate-900">가족 쇼핑 모드</p>
            <p className="text-[11px] text-slate-500">켜 두면 활동에 쇼핑 맥락이 남아요.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={hub.sharedShoppingMode}
            onClick={() => onToggleMode(!hub.sharedShoppingMode)}
            className={`relative h-8 w-14 shrink-0 rounded-full transition ${
              hub.sharedShoppingMode ? "bg-[#FF853E]" : "bg-slate-200"
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                hub.sharedShoppingMode ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onGoGear}
            className="flex-1 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white shadow-sm"
          >
            육아용품 함께 보기
          </button>
          <button
            type="button"
            onClick={onNotify}
            className="flex-1 rounded-2xl border border-[#FFD2BF] bg-[#FFF8F4] py-3 text-sm font-bold text-[#C2410C]"
          >
            가족에게 알림(데모)
          </button>
        </div>
      </section>

      <section className="card-soft p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">가족 체크리스트</h3>
            <p className="mt-1 text-xs text-slate-500">누가 먼저 해도 상태가 함께 동기화돼요. (로컬 데모)</p>
          </div>
          <p className="text-xs font-bold text-[#C2410C]">
            {doneCount}/{todos.length} 완료
          </p>
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={todoDraft}
            onChange={(e) => setTodoDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onAddTodo();
            }}
            placeholder="예: 분유 2단계 재고 확인"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none ring-1 ring-slate-100 focus:border-[#FFB089] focus:ring-2 focus:ring-[#FF853E]/25"
          />
          <button
            type="button"
            onClick={onAddTodo}
            className="shrink-0 rounded-xl bg-[#FF853E] px-4 py-2.5 text-sm font-bold text-white shadow-sm"
          >
            추가
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {todos.map((t) => (
            <li key={t.id} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
              <button
                type="button"
                onClick={() => onToggleTodo(t.id)}
                className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold ${
                  t.done ? "border-[#FFB089] bg-[#FF853E] text-white" : "border-slate-300 text-slate-300"
                }`}
                aria-label={t.done ? "완료 해제" : "완료"}
              >
                ✓
              </button>
              <p className={`min-w-0 flex-1 text-sm ${t.done ? "text-slate-400 line-through" : "text-slate-800"}`}>{t.text}</p>
              <button
                type="button"
                onClick={() => onRemoveTodo(t.id)}
                className="shrink-0 text-[11px] font-semibold text-slate-400 underline"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-soft p-5">
        <h3 className="text-sm font-bold text-slate-900">가족 활동</h3>
        <ul className="mt-3 max-h-[min(52vh,420px)] space-y-3 overflow-y-auto pr-1">
          {activities.map((a) => (
            <li key={a.id} className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {a.actorName}
                <span className="mx-1 font-normal text-slate-300">·</span>
                {new Date(a.at).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="mt-1 text-[13px] font-medium leading-snug text-slate-800">{a.message}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
