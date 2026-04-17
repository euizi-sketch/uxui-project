export type SleepRhythmType = "owl" | "regular" | "random";
export type ActivityLevel = "low" | "mid" | "high";

export type GrowthRhythmProfile = {
  sleepType: SleepRhythmType;
  /** 0 = 소식, 100 = 대식 */
  mealVolume: number;
  /** 1–5, 편식 정도 */
  pickyLevel: number;
  activityLevel: ActivityLevel;
  sleepInsight: string;
  mealInsight: string;
  activityInsight: string;
  updatedAt: string;
  windowDays: number;
};

const STORAGE_KEY = "momoA.growthRhythmProfile";

const DEFAULT_PROFILE: GrowthRhythmProfile = {
  sleepType: "owl",
  mealVolume: 42,
  pickyLevel: 3,
  activityLevel: "mid",
  sleepInsight: "평균 취침이 지난주보다 20분 늦어졌어요.",
  mealInsight: "점심 간격이 조금 불규칙했어요.",
  activityInsight: "오후에 활동 피크가 있었어요.",
  updatedAt: new Date().toISOString(),
  windowDays: 7,
};

export function loadGrowthRhythmProfile(): GrowthRhythmProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const o = JSON.parse(raw) as Partial<GrowthRhythmProfile>;
    if (!o.sleepType || typeof o.mealVolume !== "number") return DEFAULT_PROFILE;
    return {
      sleepType: o.sleepType,
      mealVolume: Math.min(100, Math.max(0, o.mealVolume)),
      pickyLevel: Math.min(5, Math.max(1, Number(o.pickyLevel) || 3)),
      activityLevel:
        o.activityLevel === "low" || o.activityLevel === "high" ? o.activityLevel : "mid",
      sleepInsight: typeof o.sleepInsight === "string" ? o.sleepInsight : DEFAULT_PROFILE.sleepInsight,
      mealInsight: typeof o.mealInsight === "string" ? o.mealInsight : DEFAULT_PROFILE.mealInsight,
      activityInsight:
        typeof o.activityInsight === "string" ? o.activityInsight : DEFAULT_PROFILE.activityInsight,
      updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : DEFAULT_PROFILE.updatedAt,
      windowDays: typeof o.windowDays === "number" ? o.windowDays : 7,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveGrowthRhythmProfile(p: GrowthRhythmProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export const SLEEP_TYPE_COPY: Record<
  SleepRhythmType,
  { icon: string; label: string; hint: string; badge?: string }
> = {
  owl: {
    icon: "🌙",
    label: "올빼미형",
    hint: "밤늦게까지 활동 에너지가 남아 있고, 취침이 늦어지는 경향이 있어요.",
    badge: "🦉",
  },
  regular: {
    icon: "☀️",
    label: "규칙형",
    hint: "취침·기상 시간이 비교적 일정해요.",
  },
  random: {
    icon: "🔀",
    label: "랜덤형",
    hint: "날짜마다 수면 리듬이 달라요. 외부 자극이나 컨디션 영향이 클 수 있어요.",
  },
};

export function recommendationsForRhythm(p: GrowthRhythmProfile): string[] {
  const out: string[] = [];
  if (p.sleepType === "owl") {
    out.push("늦은 취침 루틴", "저각도 야간 조명", "수면 전 스토리");
  } else if (p.sleepType === "regular") {
    out.push("리듬 유지 팁", "낮잠 타이밍");
  } else {
    out.push("수면 환경 정리", "취침 신호 루틴");
  }
  if (p.pickyLevel >= 4) out.push("편식 완화 식단", "질감 단계별 식사");
  if (p.mealVolume < 35) out.push("소량 자주 식사");
  if (p.mealVolume > 65) out.push("활동 후 간식");
  if (p.activityLevel === "high") out.push("에너지 소모 놀이");
  return [...new Set(out)].slice(0, 4);
}
