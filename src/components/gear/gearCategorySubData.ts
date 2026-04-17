/** 대분류(id)별 서브 카테고리 — 그리드 표시용 데모 */
export const GEAR_SUBCATEGORIES: Record<
  string,
  readonly { id: string; label: string; emoji: string }[]
> = {
  all: [
    { id: "a1", label: "기저귀", emoji: "🧷" },
    { id: "a2", label: "물티슈", emoji: "🧻" },
    { id: "a3", label: "분유·젖병", emoji: "🍼" },
    { id: "a4", label: "이유식", emoji: "🥣" },
    { id: "a5", label: "유모차", emoji: "🛒" },
    { id: "a6", label: "장난감", emoji: "🧸" },
    { id: "a7", label: "안전용품", emoji: "🛡️" },
    { id: "a8", label: "스킨케어", emoji: "🧴" },
    { id: "a9", label: "목욕·위생", emoji: "🛁" },
  ],
  diaper: [
    { id: "d1", label: "기저귀", emoji: "🧷" },
    { id: "d2", label: "물티슈", emoji: "🧻" },
    { id: "d3", label: "손·소독", emoji: "🧴" },
    { id: "d4", label: "매트", emoji: "🟦" },
    { id: "d5", label: "쓰레기통", emoji: "🗑️" },
    { id: "d6", label: "기저귀크림", emoji: "✨" },
  ],
  feed: [
    { id: "f1", label: "분유", emoji: "🍼" },
    { id: "f2", label: "젖병", emoji: "🍼" },
    { id: "f3", label: "젖꼭지", emoji: "🫧" },
    { id: "f4", label: "이유식", emoji: "🥣" },
    { id: "f5", label: "간식", emoji: "🍪" },
    { id: "f6", label: "소독기", emoji: "♨️" },
    { id: "f7", label: "수유패드", emoji: "🧺" },
  ],
  out: [
    { id: "o1", label: "유모차", emoji: "🛒" },
    { id: "o2", label: "카시트", emoji: "💺" },
    { id: "o3", label: "아기띠", emoji: "🎒" },
    { id: "o4", label: "기저귀가방", emoji: "👜" },
    { id: "o5", label: "양산·해마", emoji: "⛱️" },
    { id: "o6", label: "휴대용", emoji: "🧳" },
  ],
  toy: [
    { id: "t1", label: "치발기", emoji: "🦷" },
    { id: "t2", label: "놀이매트", emoji: "🟩" },
    { id: "t3", label: "블록·퍼즐", emoji: "🧱" },
    { id: "t4", label: "인형", emoji: "🧸" },
    { id: "t5", label: "도서", emoji: "📚" },
    { id: "t6", label: "미술·음악", emoji: "🎨" },
  ],
  safe: [
    { id: "s1", label: "모니터", emoji: "📷" },
    { id: "s2", label: "콘센트", emoji: "🔌" },
    { id: "s3", label: "모서리", emoji: "📐" },
    { id: "s4", label: "안전문", emoji: "🚪" },
    { id: "s5", label: "온습도", emoji: "🌡️" },
    { id: "s6", label: "가습기", emoji: "💨" },
  ],
};
