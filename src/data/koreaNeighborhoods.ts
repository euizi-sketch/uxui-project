import type { AddressUnit } from "sigungu/dist/types/address";
import { sidoList, getSub } from "sigungu";

const collator = new Intl.Collator("ko");

function sortedNames(list: AddressUnit[]): string[] {
  return [...list].sort((a, b) => collator.compare(a.name, b.name)).map((x) => x.name);
}

const sidoMap = new Map<string, AddressUnit>();
(sidoList as AddressUnit[]).forEach((s) => sidoMap.set(s.name, s));

const cachedSidoNames: string[] = sortedNames(sidoList as AddressUnit[]);

/** 전국 시·도 이름 (행정구역 기준, `sigungu` 데이터) */
export function getSidoNames(): string[] {
  return cachedSidoNames;
}

export function getSigunguNames(sidoName: string): string[] {
  const sido = sidoMap.get(sidoName);
  if (!sido) return [];
  return sortedNames(getSub(sido) as AddressUnit[]);
}

export function getEmdongNames(sidoName: string, sigunguName: string): string[] {
  const sido = sidoMap.get(sidoName);
  if (!sido) return [];
  const sigungu = (getSub(sido) as AddressUnit[]).find((g) => g.name === sigunguName);
  if (!sigungu) return [];
  return sortedNames(getSub(sigungu) as AddressUnit[]);
}

/** `{시도} {시군구} {동읍면}` 전체 목록 — `sigungu` 행정구역 데이터 기준 (한 번만 생성) */
let cachedAllEmdongLines: string[] | null = null;

export function getAllKoreaEmdongAddressLines(): string[] {
  if (cachedAllEmdongLines) return cachedAllEmdongLines;
  const lines: string[] = [];
  for (const sido of sidoList as AddressUnit[]) {
    for (const g of getSub(sido) as AddressUnit[]) {
      for (const e of getSub(g) as AddressUnit[]) {
        lines.push(`${sido.name} ${g.name} ${e.name}`);
      }
    }
  }
  cachedAllEmdongLines = lines.sort((a, b) => collator.compare(a, b));
  return cachedAllEmdongLines;
}

/**
 * 부모 프로필 등 주소 검색 — 전국 동·읍·면 단위 문자열에서 부분 일치 검색 (도로명 API 없음).
 * @param maxResults 목록 과다 방지 상한 (기본 250)
 */
export function searchKoreaAdminAddressLines(query: string, maxResults = 250): string[] {
  const q = query.replace(/\s+/g, " ").trim();
  if (!q) return [];
  const all = getAllKoreaEmdongAddressLines();
  const hits: string[] = [];
  for (let i = 0; i < all.length && hits.length < maxResults; i++) {
    const line = all[i];
    if (line.includes(q)) hits.push(line);
  }
  return hits;
}
