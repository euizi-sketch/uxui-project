/** 맞춤 리포트 세 축 — 점수·구간 (HomeHeroStrip / MetricCoachModal 공유) */

export type MeaningLevel = "low" | "mid" | "high";

export function scoreToMeaningLevel(score: number): MeaningLevel {
  if (score < 38) return "low";
  if (score < 72) return "mid";
  return "high";
}

export function preferenceClarityScore(interestCount: number): number {
  return Math.min(100, Math.round(12 + interestCount * 22));
}

export function recommendationFitScore(interestCount: number, feedCount: number): number {
  const base = interestCount > 0 ? 28 : 12;
  const feedPart = Math.min(52, feedCount * 10);
  const interestBoost = Math.min(20, interestCount * 5);
  return Math.min(100, Math.round(base + feedPart + interestBoost));
}

export function saveSignalScore(scrapCount: number): number {
  return Math.min(100, Math.round(18 + scrapCount * 17));
}

export type MetricCoachKey = "pref" | "rec" | "save";
