import { type ReactNode, useState } from "react";
import {
  loadGrowthRhythmProfile,
  SLEEP_TYPE_COPY,
  type GrowthRhythmProfile,
  recommendationsForRhythm,
} from "./rhythmProfileStorage";

function formatUpdated(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("ko-KR", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function SectionShell({
  title,
  icon,
  children,
  dense,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  dense?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl ${
        dense
          ? "bg-[#FFF8F4]/95 p-2.5"
          : "bg-white/95 p-4 shadow-[0_4px_24px_-12px_rgba(255,133,62,0.15)] ring-1 ring-[#FFD2BF]/45"
      }`}
    >
      <div className={`flex items-center gap-2.5 ${dense ? "mb-2" : "mb-3"}`}>
        <span
          className={`flex shrink-0 items-center justify-center rounded-2xl bg-[#FFF1EA] text-[#E85A20] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ${
            dense ? "h-8 w-8 text-base" : "h-10 w-10 text-xl ring-1 ring-[#FFD2BF]/60"
          }`}
          aria-hidden="true"
        >
          {icon}
        </span>
        <h3 className={`font-bold tracking-tight text-slate-900 ${dense ? "text-xs" : "text-sm"}`}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function MealGauge({ value, dense }: { value: number; dense?: boolean }) {
  const pct = Math.min(100, Math.max(0, value));
  const lean = pct < 40 ? "소식에 가까워요" : pct > 60 ? "대식에 가까워요" : "중간이에요";
  return (
    <div className={dense ? "space-y-1" : "space-y-2"}>
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-center justify-between text-xs font-normal text-slate-500">
          <span>소식</span>
          <span>대식</span>
        </div>
        <span className="shrink-0 text-[11px] font-semibold text-[#FF853E]">{lean}</span>
      </div>
      <div
        className={`relative overflow-hidden rounded-full bg-[#FFF5ED] ${
          dense ? "h-2.5" : "h-3 ring-1 ring-[#FFD2BF]/50"
        }`}
        role="img"
        aria-label={`식사량: 소식 쪽 ${100 - pct}%, 대식 쪽 ${pct}%`}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[#FF853E]/90"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#FF853E] shadow-[0_2px_8px_rgba(255,133,62,0.45)] ring-2 ring-white/90"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PickyDots({ level, dense }: { level: number; dense?: boolean }) {
  const n = Math.min(5, Math.max(1, Math.round(level)));
  return (
    <div
      className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${
        dense ? "mt-2" : "mt-4"
      }`}
    >
      <span className="text-xs font-semibold text-slate-700">편식 정도</span>
      <div className="flex items-center gap-2" aria-label={`편식 정도 ${n}단계`}>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full ${
                i <= n ? "bg-amber-500 ring-1 ring-amber-300/60" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-bold tabular-nums text-slate-500">{n}/5</span>
      </div>
    </div>
  );
}

function ActivityRow({
  level,
  insight,
  dense,
}: {
  level: GrowthRhythmProfile["activityLevel"];
  insight: string;
  dense?: boolean;
}) {
  const items: { key: GrowthRhythmProfile["activityLevel"]; label: string }[] = [
    { key: "low", label: "낮음" },
    { key: "mid", label: "보통" },
    { key: "high", label: "높음" },
  ];
  return (
    <div className={dense ? "space-y-1.5" : "space-y-3"}>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className={dense ? "text-lg" : "text-xl"} aria-hidden="true">
          {level === "high" ? "⚡" : "🎯"}
        </span>
        <span className="text-xs font-semibold text-slate-800">활동 에너지</span>
        {level === "high" && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200/80">
            높은 편
          </span>
        )}
      </div>
      <div className="flex gap-1 rounded-2xl bg-[#FFF8F4] p-1 ring-1 ring-[#FFD2BF]/40">
        {items.map(({ key, label }) => (
          <div
            key={key}
            className={`flex-1 rounded-xl text-center text-xs font-bold transition ${
              dense ? "py-1.5" : "py-2.5"
            } ${
              level === key
                ? "bg-white text-[#FF853E] shadow-[0_2px_8px_-2px_rgba(255,133,62,0.35)] ring-1 ring-[#FFD2BF]/70"
                : "text-slate-400"
            }`}
          >
            {label}
          </div>
        ))}
      </div>
      <p
        className={`text-xs font-normal leading-relaxed text-slate-600 ${
          dense ? "line-clamp-2" : ""
        }`}
      >
        {insight}
      </p>
    </div>
  );
}

type GrowthRhythmProfileCardProps = {
  /** 마이페이지 등 한 화면에 다른 블록과 함께 보일 때 높이·여백 축소 */
  dense?: boolean;
};

export default function GrowthRhythmProfileCard({ dense = false }: GrowthRhythmProfileCardProps) {
  const [profile] = useState<GrowthRhythmProfile>(() => loadGrowthRhythmProfile());
  const [detailOpen, setDetailOpen] = useState(false);
  const sleep = SLEEP_TYPE_COPY[profile.sleepType];
  const recos = recommendationsForRhythm(profile);
  const updatedLabel = formatUpdated(profile.updatedAt);

  return (
    <>
      <section
        className={`relative flex flex-col overflow-hidden rounded-[1.75rem] bg-[#FFF5ED] ${
          dense
            ? "mt-0 max-h-[min(36dvh,14.5rem)] p-3 sm:max-h-[min(38dvh,15.5rem)]"
            : "mt-4 max-h-[min(40dvh,16.5rem)] p-4 shadow-[0_16px_48px_-20px_rgba(255,133,62,0.22)] ring-1 ring-[#FFD2BF]/60 sm:max-h-[min(44dvh,18rem)] sm:p-5"
        }`}
      >
        <div
          className="pointer-events-none absolute -right-16 top-0 h-36 w-36 rounded-full bg-[#FF853E]/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-sky-200/25 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex shrink-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full bg-[#FFF1EA] px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#FF853E] ${
                  dense ? "" : "ring-2 ring-[#FF853E]/25"
                }`}
              >
                리듬 맞춤
              </span>
            </div>
            <h2
              className={`mt-2 font-bold tracking-tight text-[#C2410C] ${dense ? "text-sm" : "text-base sm:text-lg"}`}
            >
              성장 리듬 프로파일
            </h2>
            <p
              className={`font-normal leading-relaxed text-slate-600 ${dense ? "mt-0.5 text-[11px]" : "mt-1 text-xs"}`}
            >
              최근 <span className="font-bold text-[#FF853E]">{profile.windowDays}일</span> 기준으로
              요약했어요
            </p>
            {updatedLabel ? (
              <p className={`mt-1 font-medium text-slate-400 ${dense ? "text-[10px]" : "text-[11px]"}`}>
                반영 · {updatedLabel}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            className={`inline-flex shrink-0 items-center justify-center rounded-2xl bg-white font-bold text-[#FF853E] shadow-[0_4px_14px_-4px_rgba(255,133,62,0.45)] transition hover:bg-[#FFFCF9] ${
              dense
                ? "h-9 min-w-[2.25rem] text-sm"
                : "h-11 min-w-[2.75rem] text-base ring-2 ring-[#FFD2BF]/70 hover:ring-[#FFB089]"
            }`}
            aria-label="성장 리듬 유형 설명 보기"
          >
            ⓘ
          </button>
        </div>

        <div
          role="region"
          aria-label="성장 리듬 상세 내용"
          className={`relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-0.5 [scrollbar-width:thin] ${dense ? "mt-2.5" : "mt-4"}`}
        >
        <div
          className={`relative grid sm:grid-cols-2 ${dense ? "gap-2 pb-1" : "gap-3 pb-1.5"}`}
        >
          <SectionShell title="수면 패턴" icon={sleep.icon} dense={dense}>
            <div className={`flex flex-wrap items-center ${dense ? "gap-1.5" : "gap-2"}`}>
              <span
                className={`rounded-xl bg-[#FF853E] font-bold text-white shadow-sm ${
                  dense ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
                }`}
              >
                {sleep.label}
              </span>
              {sleep.badge && (
                <span
                  className={`inline-flex items-center justify-center rounded-full bg-[#FFF8F4] ${
                    dense
                      ? "h-7 w-7 text-sm"
                      : "h-8 w-8 text-base ring-2 ring-[#FFD2BF]/70"
                  }`}
                  title="올빼미 리듬"
                >
                  {sleep.badge}
                </span>
              )}
            </div>
            <p
              className={`text-xs font-normal leading-relaxed text-slate-600 ${
                dense ? "mt-2 line-clamp-2" : "mt-3"
              }`}
            >
              {profile.sleepInsight}
            </p>
          </SectionShell>

          <SectionShell title="식사 성향" icon="🍽" dense={dense}>
            <MealGauge value={profile.mealVolume} dense={dense} />
            <PickyDots level={profile.pickyLevel} dense={dense} />
            <p
              className={`text-xs font-normal leading-relaxed text-slate-600 ${
                dense ? "mt-2 line-clamp-2" : "mt-3"
              }`}
            >
              {profile.mealInsight}
            </p>
          </SectionShell>

          <div className="sm:col-span-2">
            <SectionShell title="활동성" icon={profile.activityLevel === "high" ? "⚡" : "🎯"} dense={dense}>
              <ActivityRow level={profile.activityLevel} insight={profile.activityInsight} dense={dense} />
            </SectionShell>
          </div>
        </div>

        <div
          className={`relative overflow-hidden rounded-2xl bg-[#FFF8F4] ${
            dense ? "mt-2.5 p-2.5" : "mt-4 p-4 ring-1 ring-[#FFD2BF]/50"
          }`}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#FFB089]/35" aria-hidden />
          <p className={`font-bold text-slate-900 ${dense ? "text-[11px]" : "text-xs"}`}>
            이 패턴에 맞춘 추천
          </p>
          {!dense ? (
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
              콘텐츠·상품 추천과 연결될 수 있어요
            </p>
          ) : null}
          <div className={`flex flex-wrap ${dense ? "mt-1.5 gap-1" : "mt-3 gap-2"}`}>
            {recos.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  window.alert(
                    `「${tag}」 추천으로 연결됩니다.\n(데모) 실서비스에서는 콘텐츠·상품 피드로 이동합니다.`
                  )
                }
                className={`rounded-full bg-white font-bold text-[#E85A20] shadow-[0_2px_10px_-4px_rgba(255,133,62,0.35)] transition hover:bg-[#FFF8F4] ${
                  dense
                    ? "px-2 py-1 text-[10px]"
                    : "px-3.5 py-2 text-xs ring-1 ring-[#FFD2BF]/80 hover:ring-[#FFB089]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {!dense ? (
            <button
              type="button"
              onClick={() =>
                window.alert("맞춤 콘텐츠 피드로 이동 (데모)\n쿼리: ?from=rhythm")
              }
              className="mt-3 text-xs font-bold text-[#FF853E] underline decoration-[#FFD2BF] underline-offset-2 hover:decoration-[#FF853E]"
            >
              맞춤 콘텐츠 보기 →
            </button>
          ) : null}
        </div>
        </div>
      </section>

      {detailOpen && (
        <div className="app-viewport-fixed z-[75] flex items-end justify-center bg-black/40 sm:items-center">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="닫기"
            onClick={() => setDetailOpen(false)}
          />
          <div className="relative z-[76] max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-[1.75rem] bg-[#FFFCFA] shadow-2xl shadow-orange-200/40 ring-1 ring-[#FFD2BF]/60 sm:rounded-[1.75rem]">
            <div className="rounded-t-[1.75rem] bg-[#FF853E] px-5 pb-4 pt-5 sm:rounded-t-[1.75rem]">
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-white drop-shadow-sm">유형 안내</p>
                <button
                  type="button"
                  onClick={() => setDetailOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>
              <p className="mt-1 text-xs font-semibold text-white/90">수면 패턴 유형을 참고해 보세요</p>
            </div>
            <div className="space-y-3 px-5 pb-6 pt-4">
              <ul className="space-y-3 text-sm text-slate-600">
                {(Object.keys(SLEEP_TYPE_COPY) as Array<keyof typeof SLEEP_TYPE_COPY>).map((key) => {
                  const c = SLEEP_TYPE_COPY[key];
                  return (
                    <li
                      key={key}
                      className="rounded-2xl border border-[#FFD2BF]/40 bg-white px-4 py-3.5 shadow-[0_4px_16px_-10px_rgba(255,133,62,0.2)]"
                    >
                      <p className="text-sm font-bold text-slate-900">
                        <span className="mr-1.5">{c.icon}</span>
                        {c.label}
                      </p>
                      <p className="mt-2 text-xs font-normal leading-relaxed text-slate-600">{c.hint}</p>
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs font-semibold leading-relaxed text-slate-400">
                데이터는 가정 내 기록·설문을 바탕으로 주기적으로 갱신됩니다. (현재 화면은 데모
                값입니다.)
              </p>
              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="w-full rounded-2xl bg-[#FF853E] py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(255,133,62,0.55)] ring-2 ring-[#FFD2BF]/50 transition hover:brightness-[1.03]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
