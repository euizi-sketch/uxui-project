import { useEffect, useMemo, useState } from "react";
import { getEmdongNames, getSigunguNames, getSidoNames } from "../data/koreaNeighborhoods";

type SelectStep = "region" | "gu" | "dong";

type Props = {
  /** 커뮤니티 헤더 등에서 트리거 너비·정렬 조절 */
  triggerClassName?: string;
};

/**
 * 동네 설정 · 주소 등록 · 현재 위치 찾기 (커뮤니티 탭 전용)
 */
export default function NeighborhoodLocationControl({ triggerClassName = "" }: Props) {
  const [region, setRegion] = useState(() => localStorage.getItem("momoA.region") || "");
  const [gu, setGu] = useState(() => localStorage.getItem("momoA.gu") || "");
  const [dong, setDong] = useState(() => localStorage.getItem("momoA.dong") || "");
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);
  const [selectStep, setSelectStep] = useState<SelectStep>("region");
  const [neighborhoodQuery, setNeighborhoodQuery] = useState("");

  const locationText =
    [region, gu, dong].filter(Boolean).join(" · ") || "나의 동네";

  const regions = getSidoNames();
  const gus = region ? getSigunguNames(region) : [];
  const dongs = region && gu ? getEmdongNames(region, gu) : [];

  const q = neighborhoodQuery.trim().toLowerCase();

  const filteredGus = useMemo(() => {
    if (!q) return gus;
    return gus.filter((g) => g.toLowerCase().includes(q));
  }, [gus, q]);

  const filteredDongs = useMemo(() => {
    if (!q) return dongs;
    return dongs.filter((d) => d.toLowerCase().includes(q));
  }, [dongs, q]);

  useEffect(() => {
    if (neighborhoodOpen) setNeighborhoodQuery("");
  }, [neighborhoodOpen, selectStep, region, gu]);

  const saveLocation = (next: { region?: string; gu?: string; dong?: string }) => {
    if (next.region !== undefined) {
      setRegion(next.region);
      localStorage.setItem("momoA.region", next.region);
    }
    if (next.gu !== undefined) {
      setGu(next.gu);
      localStorage.setItem("momoA.gu", next.gu);
    }
    if (next.dong !== undefined) {
      setDong(next.dong);
      localStorage.setItem("momoA.dong", next.dong);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setNeighborhoodOpen(true);
          setSelectStep(region ? (gu ? "dong" : "gu") : "region");
        }}
        className={`relative z-[1] flex min-w-0 items-center gap-0.5 rounded-2xl bg-transparent py-0.5 pr-0.5 text-left ${triggerClassName}`}
        aria-label="동네 변경"
      >
        <p className="min-w-0 flex-1 text-xs font-semibold leading-snug tracking-tight text-slate-600 line-clamp-2 sm:text-[13px]">
          {locationText}
        </p>
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[9px] font-semibold leading-none text-slate-500 shadow-sm ring-1 ring-slate-200">
          ▾
        </span>
      </button>

      {neighborhoodOpen && (
        <div className="app-viewport-fixed z-50 bg-black/40">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="닫기"
            onClick={() => setNeighborhoodOpen(false)}
          />
          <div className="absolute left-1/2 top-24 z-[51] w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="space-y-1">
                <p className="text-xs font-normal text-slate-500">내 동네 설정</p>
                <p className="text-sm font-bold text-slate-900">
                  {selectStep === "region"
                    ? "지역 선택"
                    : selectStep === "gu"
                      ? "구/군 선택"
                      : "동/읍/면 선택"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectStep !== "region" && (
                  <button
                    type="button"
                    onClick={() => setSelectStep((s) => (s === "dong" ? "gu" : "region"))}
                    className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    이전
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setNeighborhoodOpen(false)}
                  className="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100"
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>
            </div>

            {(selectStep === "gu" || selectStep === "dong") && (
              <div className="border-b border-slate-100 px-5 py-3">
                <label className="sr-only" htmlFor="neighborhood-search-community">
                  {selectStep === "gu" ? "구·군 검색" : "동·읍·면 검색"}
                </label>
                <input
                  id="neighborhood-search-community"
                  type="search"
                  value={neighborhoodQuery}
                  onChange={(e) => setNeighborhoodQuery(e.target.value)}
                  placeholder={selectStep === "gu" ? "구·군 이름 검색" : "동·읍·면 이름 검색"}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none ring-[#FF853E]/30 placeholder:text-slate-400 focus:border-[#FF853E] focus:bg-white focus:ring-2"
                  autoComplete="off"
                />
              </div>
            )}

            <div className="divide-y divide-slate-100">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50"
                onClick={() => {
                  window.alert("내 주소 등록하기(데모)");
                  setNeighborhoodOpen(false);
                }}
              >
                <span className="text-lg">＋</span>
                내 주소 등록하기
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50"
                onClick={() => {
                  window.alert("현재 위치로 찾기(데모)");
                  setNeighborhoodOpen(false);
                }}
              >
                <span className="text-lg">⌖</span>
                현재 위치로 찾기
              </button>
            </div>

            <div className="max-h-[60dvh] overflow-y-auto px-2 py-2">
              {selectStep === "region" &&
                regions.map((r) => {
                  const selected = r === region;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        saveLocation({ region: r, gu: "", dong: "" });
                        setSelectStep("gu");
                      }}
                      className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                        selected
                          ? "bg-[#FFF1EA] text-[#FF853E]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}

              {selectStep === "gu" &&
                (filteredGus.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm font-normal text-slate-500">
                    검색 결과가 없어요
                  </p>
                ) : (
                  filteredGus.map((g) => {
                    const selected = g === gu;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          saveLocation({ gu: g, dong: "" });
                          setSelectStep("dong");
                        }}
                        className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                          selected
                            ? "bg-[#FFF1EA] text-[#FF853E]"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })
                ))}

              {selectStep === "dong" &&
                (filteredDongs.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm font-normal text-slate-500">
                    검색 결과가 없어요
                  </p>
                ) : (
                  filteredDongs.map((d) => {
                    const selected = d === dong;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          saveLocation({ dong: d });
                          setNeighborhoodOpen(false);
                        }}
                        className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                          selected
                            ? "bg-[#FFF1EA] text-[#FF853E]"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
