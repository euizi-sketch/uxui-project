import { useMemo, useState } from "react";
import { loadMyPageProfileFromStorage } from "../profile/momoProfileStorage";
import { loadStoredAccount } from "../profile/accountCredentialsStorage";
import LogoutFlowPanel from "./LogoutFlowPanel";
import WithdrawFlowPanel from "./WithdrawFlowPanel";
import { APP_NOTICES, type NoticeItem } from "./notices";
import { legalSections, legalTitle, type LegalDocId } from "./legalCopy";
import {
  loadNotificationPreferences,
  saveNotificationPreferences,
  type NotificationPreferences,
} from "./settingsPreferences";

type SettingsInnerView =
  | { kind: "menu" }
  | { kind: "notifications" }
  | { kind: "notificationsDetail" }
  | { kind: "legal"; doc: LegalDocId }
  | { kind: "notices" }
  | { kind: "notice"; notice: NoticeItem }
  | { kind: "account" }
  | { kind: "logout" }
  | { kind: "withdraw" }
  | { kind: "version"; version: string };

type Props = {
  onBack: () => void;
  appVersion: string;
  onOpenInquiries: () => void;
};

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 px-5 py-4 ${disabled ? "opacity-50" : ""}`}>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        {description ? (
          <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative h-8 w-[3.25rem] shrink-0 rounded-full transition ${
          checked ? "bg-[#FF853E]" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
            checked ? "left-[calc(100%-1.75rem)]" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsScreen({ onBack, appVersion, onOpenInquiries }: Props) {
  const [view, setView] = useState<SettingsInnerView>({ kind: "menu" });
  const [prefs, setPrefs] = useState<NotificationPreferences>(() => loadNotificationPreferences());

  const nick = loadMyPageProfileFromStorage().nickname?.trim();
  const storedAcc = loadStoredAccount();
  const accountDisplayName = nick || storedAcc?.userId || "";

  const persistPrefs = (next: NotificationPreferences) => {
    setPrefs(next);
    saveNotificationPreferences(next);
  };

  const masterOff = !prefs.masterEnabled;

  const menuSections = useMemo(
    () => [
      {
        title: "설정",
        items: [
          {
            label: "알림 설정",
            onClick: () => setView({ kind: "notifications" }),
          },
          {
            label: "상세 알림 설정",
            onClick: () => setView({ kind: "notificationsDetail" }),
          },
        ],
      },
      {
        title: "고객센터",
        items: [
          {
            label: "문의하기",
            onClick: () => {
              onBack();
              onOpenInquiries();
            },
          },
          {
            label: `앱 버전 ${appVersion}`,
            onClick: () => setView({ kind: "version", version: appVersion }),
          },
        ],
      },
      {
        title: "정보",
        items: [
          {
            label: "서비스 이용약관",
            onClick: () => setView({ kind: "legal", doc: "terms" }),
          },
          {
            label: "개인정보 처리방침",
            onClick: () => setView({ kind: "legal", doc: "privacy" }),
          },
          {
            label: "위치기반서비스 이용약관",
            onClick: () => setView({ kind: "legal", doc: "location" }),
          },
          {
            label: "공지사항",
            onClick: () => setView({ kind: "notices" }),
          },
          {
            label: "맘맘 멤버십 이용약관",
            onClick: () => setView({ kind: "legal", doc: "membership" }),
          },
        ],
      },
      {
        title: "계정",
        items: [
          {
            label: "계정관리",
            onClick: () => setView({ kind: "account" }),
          },
        ],
      },
    ],
    [appVersion, onBack, onOpenInquiries]
  );

  const headerTitle =
    view.kind === "menu"
      ? "설정"
      : view.kind === "notifications"
        ? "알림 설정"
        : view.kind === "notificationsDetail"
          ? "상세 알림 설정"
          : view.kind === "legal"
            ? legalTitle(view.doc)
            : view.kind === "notices"
              ? "공지사항"
              : view.kind === "notice"
                ? view.notice.title
                : view.kind === "account"
                  ? "계정관리"
                  : view.kind === "logout"
                    ? "로그아웃"
                    : view.kind === "withdraw"
                      ? "회원 탈퇴"
                      : "앱 정보";

  const innerBack = () => {
    if (view.kind === "menu") onBack();
    else if (view.kind === "notice") setView({ kind: "notices" });
    else if (view.kind === "logout" || view.kind === "withdraw") setView({ kind: "account" });
    else setView({ kind: "menu" });
  };

  return (
    <div className="min-h-dvh bg-white pb-safe-tab">
      <header className="sticky top-0 z-40 bg-white">
        <div className="mx-auto w-full max-w-app">
          <div className="relative flex items-center justify-center px-4 py-4">
            <button
              type="button"
              onClick={innerBack}
              className="absolute left-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-700 hover:bg-slate-100"
              aria-label="뒤로가기"
            >
              ←
            </button>
            <h1 className="text-lg font-bold text-slate-900">{headerTitle}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-app">
        {view.kind === "menu" &&
          menuSections.map((section) => (
            <div key={section.title} className="border-t border-slate-200">
              <div className="px-5 py-4">
                <p className="text-sm font-semibold text-slate-800">{section.title}</p>
              </div>
              <div className="divide-y divide-slate-200">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50"
                  >
                    <span className="text-sm font-medium text-slate-800">{item.label}</span>
                    <span className="text-slate-400">›</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

        {view.kind === "notifications" && (
          <div className="divide-y divide-slate-200 border-t border-slate-200">
            <ToggleRow
              label="알림 허용"
              description="끄면 유형별 설정과 관계없이 인앱·안내 알림이 제한됩니다."
              checked={prefs.masterEnabled}
              onChange={(v) => persistPrefs({ ...prefs, masterEnabled: v })}
            />
            <ToggleRow
              label="주문·배송"
              checked={prefs.orderShipping}
              disabled={masterOff}
              onChange={(v) => persistPrefs({ ...prefs, orderShipping: v })}
            />
            <ToggleRow
              label="혜택·프로모션"
              checked={prefs.promotion}
              disabled={masterOff}
              onChange={(v) => persistPrefs({ ...prefs, promotion: v })}
            />
            <ToggleRow
              label="커뮤니티"
              checked={prefs.community}
              disabled={masterOff}
              onChange={(v) => persistPrefs({ ...prefs, community: v })}
            />
            <ToggleRow
              label="상담·맞춤 추천"
              checked={prefs.consultation}
              disabled={masterOff}
              onChange={(v) => persistPrefs({ ...prefs, consultation: v })}
            />
          </div>
        )}

        {view.kind === "notificationsDetail" && (
          <div className="divide-y divide-slate-200 border-t border-slate-200 px-5 py-4">
            <ToggleRow
              label="야간 알림 줄이기"
              description="지정 시간대에는 방해가 적은 요약만 보여 줄 수 있어요(인앱 기준)."
              checked={prefs.nightQuietEnabled}
              disabled={masterOff}
              onChange={(v) => persistPrefs({ ...prefs, nightQuietEnabled: v })}
            />
            <div className={`space-y-3 py-4 ${masterOff || !prefs.nightQuietEnabled ? "opacity-50" : ""}`}>
              <label className="block">
                <span className="text-[11px] font-medium text-slate-500">시작 시각</span>
                <input
                  type="time"
                  value={prefs.quietStart}
                  disabled={masterOff || !prefs.nightQuietEnabled}
                  onChange={(e) => persistPrefs({ ...prefs, quietStart: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium text-slate-500">종료 시각</span>
                <input
                  type="time"
                  value={prefs.quietEnd}
                  disabled={masterOff || !prefs.nightQuietEnabled}
                  onChange={(e) => persistPrefs({ ...prefs, quietEnd: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
                />
              </label>
            </div>
          </div>
        )}

        {view.kind === "legal" && (
          <article className="border-t border-slate-200 px-5 py-6">
            {legalSections(view.doc).map((sec) => (
              <section key={sec.heading} className="mb-8">
                <h2 className="text-base font-bold text-slate-900">{sec.heading}</h2>
                <div className="mt-3 space-y-3">
                  {sec.paragraphs.map((p, i) => (
                    <p key={i} className="text-[13px] font-medium leading-relaxed text-slate-600">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </article>
        )}

        {view.kind === "notices" && (
          <div className="divide-y divide-slate-200 border-t border-slate-200">
            {APP_NOTICES.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setView({ kind: "notice", notice: n })}
                className="flex w-full flex-col items-start px-5 py-4 text-left hover:bg-slate-50"
              >
                <span className="text-[11px] font-medium text-slate-400">{n.dateLabel}</span>
                <span className="mt-1 text-sm font-bold text-slate-900">{n.title}</span>
                <span className="mt-2 line-clamp-2 text-[13px] font-medium text-slate-500">{n.body}</span>
              </button>
            ))}
          </div>
        )}

        {view.kind === "notice" && (
          <article className="border-t border-slate-200 px-5 py-6">
            <p className="text-[11px] font-medium text-slate-400">{view.notice.dateLabel}</p>
            <p className="mt-2 text-[15px] font-bold text-slate-900">{view.notice.title}</p>
            <p className="mt-4 whitespace-pre-wrap text-[13px] font-medium leading-relaxed text-slate-600">
              {view.notice.body}
            </p>
          </article>
        )}

        {view.kind === "account" && (
          <div className="border-t border-slate-200 px-5 py-6">
            <p className="text-[13px] font-medium leading-relaxed text-slate-600">
              로그아웃은 이 기기에서{" "}
              <span className="font-bold text-slate-800">로그인 세션만 종료</span>하고, 회원 정보·저장 데이터는
              유지됩니다. 같은 계정으로 다시 로그인하면 이전과 같이 이용할 수 있어요. 회원 탈퇴는 계정 이용
              종료를 의미하며, 데모 앱에서는 이 기기에 저장된 데이터를{" "}
              <span className="font-bold text-slate-800">모두 삭제</span>합니다.
            </p>
            {accountDisplayName ? (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">현재 프로필</p>
                <p className="mt-1 text-[16px] font-bold text-slate-900">{accountDisplayName}</p>
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-[12px] font-medium text-slate-500">
                저장된 닉네임·아이디가 없어요. 온보딩에서 가입·로그인을 완료하면 여기에 표시돼요.
              </p>
            )}
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setView({ kind: "logout" })}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">로그아웃</p>
                  <p className="mt-0.5 text-[12px] font-medium text-slate-500">
                    저장 데이터는 유지 · 세션만 종료 후 로그인 화면으로
                  </p>
                </div>
                <span className="text-slate-300">›</span>
              </button>
              <button
                type="button"
                onClick={() => setView({ kind: "withdraw" })}
                className="flex w-full items-center justify-between rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-4 text-left transition hover:bg-rose-50"
              >
                <div>
                  <p className="text-sm font-bold text-rose-800">회원 탈퇴</p>
                  <p className="mt-0.5 text-[12px] font-medium text-rose-700/90">
                    동의·확인 후 계정 이용 종료(로컬 전체 삭제)
                  </p>
                </div>
                <span className="text-rose-300">›</span>
              </button>
            </div>
          </div>
        )}

        {view.kind === "logout" && (
          <LogoutFlowPanel onBack={() => setView({ kind: "account" })} nicknameHint={accountDisplayName} />
        )}

        {view.kind === "withdraw" && (
          <WithdrawFlowPanel onBack={() => setView({ kind: "account" })} nicknameHint={accountDisplayName} />
        )}

        {view.kind === "version" && (
          <div className="border-t border-slate-200 px-5 py-8">
            <p className="text-center text-sm font-medium text-slate-600">
              현재 설치된 앱 버전 정보예요.
            </p>
            <p className="mt-4 text-center text-2xl font-black tabular-nums text-slate-900">
              {view.version}
            </p>
            <p className="mt-6 text-center text-[12px] font-medium leading-relaxed text-slate-500">
              웹 데모 빌드입니다. 스토어 버전과 다를 수 있어요.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
