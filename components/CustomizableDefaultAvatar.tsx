import React, { useId, memo, useMemo } from "react";

export type HairStyleId = "bob" | "short" | "ponytail";
export type ShirtStyleId = "crew" | "vneck" | "hoodie";

export type DefaultAvatarStyle = {
  hairColor: string;
  hairStyle: HairStyleId;
  shirtColor: string;
  shirtStyle: ShirtStyleId;
};

export const DEFAULT_AVATAR_STYLE: DefaultAvatarStyle = {
  hairColor: "#4a3425",
  hairStyle: "bob",
  shirtColor: "#c5d4e0",
  shirtStyle: "crew",
};

const STORAGE_KEY = "momoA.defaultAvatarStyle";

const HAIR_STYLES: HairStyleId[] = ["bob", "short", "ponytail"];
const SHIRT_STYLES: ShirtStyleId[] = ["crew", "vneck", "hoodie"];

function isHairStyle(x: string): x is HairStyleId {
  return HAIR_STYLES.includes(x as HairStyleId);
}

function isShirtStyle(x: string): x is ShirtStyleId {
  return SHIRT_STYLES.includes(x as ShirtStyleId);
}

export function loadDefaultAvatarStyleFromStorage(): DefaultAvatarStyle {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AVATAR_STYLE;
    const o = JSON.parse(raw) as Record<string, unknown>;
    return {
      hairColor: typeof o.hairColor === "string" ? o.hairColor : DEFAULT_AVATAR_STYLE.hairColor,
      hairStyle:
        typeof o.hairStyle === "string" && isHairStyle(o.hairStyle)
          ? o.hairStyle
          : DEFAULT_AVATAR_STYLE.hairStyle,
      shirtColor: typeof o.shirtColor === "string" ? o.shirtColor : DEFAULT_AVATAR_STYLE.shirtColor,
      shirtStyle:
        typeof o.shirtStyle === "string" && isShirtStyle(o.shirtStyle)
          ? o.shirtStyle
          : DEFAULT_AVATAR_STYLE.shirtStyle,
    };
  } catch {
    return DEFAULT_AVATAR_STYLE;
  }
}

export function saveDefaultAvatarStyleToStorage(s: DefaultAvatarStyle): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export const HAIR_COLOR_PRESETS = [
  "#4a3425",
  "#2d1f14",
  "#8b6914",
  "#c4a574",
  "#1e3a5f",
  "#5c3d6e",
];

export const SHIRT_COLOR_PRESETS = [
  "#c5d4e0",
  "#9fb8d4",
  "#f5c4c4",
  "#c8e6c9",
  "#e8d4f0",
  "#2d3748",
];

const HAIR_LABELS: Record<HairStyleId, string> = {
  bob: "단발",
  short: "숏컷",
  ponytail: "포니테일",
};

const SHIRT_LABELS: Record<ShirtStyleId, string> = {
  crew: "맨투맨",
  vneck: "브이넥",
  hoodie: "후드",
};

export { HAIR_LABELS, SHIRT_LABELS };

type Props = {
  avatarStyle: DefaultAvatarStyle;
  className?: string;
  /** 정사각형 기준 한 변 길이(px) */
  size?: number;
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace(/^#/, "");
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** delta: 각 채널에 더할 값 (−255~255) */
function shadeHex(hex: string, delta: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(rgb.r + delta, rgb.g + delta, rgb.b + delta);
}

const SHIRT_STROKE = "rgba(35,45,55,0.12)";

/** 양쪽 어깨·소매가 대칭인 상체 실루엣 */
function ShirtBody({ shirtStyle, fillId }: { shirtStyle: ShirtStyleId; fillId: string }) {
  const f = `url(#${fillId})`;
  const sw = 0.9;
  if (shirtStyle === "vneck") {
    return (
      <g>
        <path fill={f} stroke={SHIRT_STROKE} strokeWidth={sw} d="M 18 92 L 18 136 L 54 136 L 54 100 L 48 90 Z" />
        <path fill={f} stroke={SHIRT_STROKE} strokeWidth={sw} d="M 102 92 L 102 136 L 66 136 L 66 100 L 72 90 Z" />
        <path fill={f} stroke={SHIRT_STROKE} strokeWidth={sw} d="M 54 100 L 54 136 L 66 136 L 66 100 Z" />
      </g>
    );
  }
  if (shirtStyle === "hoodie") {
    return (
      <g>
        <path
          fill={f}
          stroke={SHIRT_STROKE}
          strokeWidth={sw}
          d="M 18 94 C 18 88 34 82 60 84 C 86 82 102 88 102 94 L 106 136 C 106 140 60 144 14 136 Z"
        />
        <path
          fill={f}
          stroke={SHIRT_STROKE}
          strokeWidth={0.75}
          d="M 40 86 Q 60 68 80 86 Q 60 78 40 86"
          opacity={0.92}
        />
      </g>
    );
  }
  return (
    <path
      fill={f}
      stroke={SHIRT_STROKE}
      strokeWidth={sw}
      d="M 18 92 C 18 86 32 80 60 82 C 88 80 102 86 102 92 L 106 136 C 106 140 60 144 14 136 L 18 92 Z"
    />
  );
}

/**
 * 이마 위만 덮는 머리 캡 — 눈·코·입이 가려지지 않게 해 일반적인 얼굴 비율을 유지합니다.
 * 포니테일은 머리 옆으로만 살짝 나옵니다.
 */
function HairCap({ hairStyle, fillId }: { hairStyle: HairStyleId; fillId: string }) {
  const F = `url(#${fillId})`;
  if (hairStyle === "short") {
    return (
      <path
        fill={F}
        d="M 36 46
           C 36 22 46 10 60 8
           C 74 10 84 22 84 46
           C 84 50 78 48 60 46
           C 42 48 36 50 36 46 Z"
      />
    );
  }
  if (hairStyle === "ponytail") {
    return (
      <g>
        <path
          fill={F}
          d="M 34 48
             C 34 18 46 6 60 4
             C 74 6 86 18 86 48
             C 86 52 78 50 60 48
             C 42 50 34 52 34 48 Z"
        />
        <ellipse cx="88" cy="32" rx="11" ry="13" fill={F} />
        <path fill={F} d="M 78 40 Q 84 32 88 30 Q 82 42 76 46 Z" opacity={0.95} />
      </g>
    );
  }
  return (
    <path
      fill={F}
      d="M 32 50
         C 32 16 44 2 60 0
         C 76 2 88 16 88 50
         C 88 54 80 52 60 50
         C 40 52 32 54 32 50 Z"
    />
  );
}

function CustomizableDefaultAvatarInner({ avatarStyle, className = "", size = 120 }: Props) {
  const uid = useId().replace(/:/g, "");

  const ids = useMemo(() => {
    const p = (x: string) => `${x}-${uid}`;
    return {
      skinFace: p("skinFace"),
      skinEar: p("skinEar"),
      skinNeck: p("skinNeck"),
      skinArm: p("skinArm"),
      hairMat: p("hairMat"),
      shirtMat: p("shirtMat"),
      cheekHi: p("cheekHi"),
      chinAo: p("chinAo"),
      sleeveShade: p("sleeveShade"),
      mouthGrad: p("mouthGrad"),
      eyeShine: p("eyeShine"),
      filtSoftDrop: p("filtSoftDrop"),
    };
  }, [uid]);

  const hairHi = shadeHex(avatarStyle.hairColor, 38);
  const hairMid = avatarStyle.hairColor;
  const hairLo = shadeHex(avatarStyle.hairColor, -42);

  const shirtHi = shadeHex(avatarStyle.shirtColor, 42);
  const shirtMid = avatarStyle.shirtColor;
  const shirtLo = shadeHex(avatarStyle.shirtColor, -38);

  const w = size;
  const h = (size * 140) / 120;

  return (
    <svg
      viewBox="0 0 120 140"
      width={w}
      height={h}
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* 상단 좌측 광원 — 피부 */}
        <radialGradient id={ids.skinFace} cx="32%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#fff8f2" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#fde4d6" />
          <stop offset="72%" stopColor="#f0c4ae" />
          <stop offset="100%" stopColor="#d9a088" />
        </radialGradient>
        <radialGradient id={ids.skinEar} cx="35%" cy="35%" r="85%">
          <stop offset="0%" stopColor="#fde4d6" />
          <stop offset="100%" stopColor="#e8b598" />
        </radialGradient>
        <linearGradient id={ids.skinNeck} x1="22%" y1="0%" x2="78%" y2="100%">
          <stop offset="0%" stopColor="#fce0d2" />
          <stop offset="100%" stopColor="#deb39a" />
        </linearGradient>
        <radialGradient id={ids.skinArm} cx="28%" cy="22%" r="75%">
          <stop offset="0%" stopColor="#ffece3" />
          <stop offset="55%" stopColor="#f5d0bc" />
          <stop offset="100%" stopColor="#d9a890" />
        </radialGradient>

        {/* 머리 — 무광 볼륨 */}
        <linearGradient id={ids.hairMat} x1="18%" y1="8%" x2="88%" y2="95%">
          <stop offset="0%" stopColor={hairHi} />
          <stop offset="42%" stopColor={hairMid} />
          <stop offset="100%" stopColor={hairLo} />
        </linearGradient>

        {/* 옷 — 매트 패브릭 */}
        <linearGradient id={ids.shirtMat} x1="22%" y1="6%" x2="78%" y2="100%">
          <stop offset="0%" stopColor={shirtHi} />
          <stop offset="48%" stopColor={shirtMid} />
          <stop offset="100%" stopColor={shirtLo} />
        </linearGradient>

        {/* 광택 하이라이트(클레이) */}
        <radialGradient id={ids.cheekHi} cx="30%" cy="30%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={ids.chinAo} cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#2d1a12" stopOpacity="0.35" />
          <stop offset="70%" stopColor="#2d1a12" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={ids.sleeveShade} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="55%" stopColor="rgba(0,0,0,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.14)" />
        </linearGradient>

        <linearGradient id={ids.mouthGrad} x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#c49a72" />
          <stop offset="100%" stopColor="#7d5238" />
        </linearGradient>

        <radialGradient id={ids.eyeShine} cx="28%" cy="28%" r="60%">
          <stop offset="0%" stopColor="#4a5568" />
          <stop offset="65%" stopColor="#1a202c" />
          <stop offset="100%" stopColor="#0d1117" />
        </radialGradient>

        <filter id={ids.filtSoftDrop} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="b" />
          <feOffset in="b" dx="1.2" dy="2.2" result="o" />
          <feComponentTransfer in="o" result="s">
            <feFuncA type="linear" slope="0.28" intercept="0" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="s" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

      </defs>

      <g filter={`url(#${ids.filtSoftDrop})`}>
        <ShirtBody shirtStyle={avatarStyle.shirtStyle} fillId={ids.shirtMat} />
        <ellipse
          cx="60"
          cy="122"
          rx="40"
          ry="22"
          fill={`url(#${ids.sleeveShade})`}
          opacity={0.35}
          style={{ mixBlendMode: "multiply" }}
        />

        {/* 팔: 양쪽 대칭 */}
        <path
          fill={`url(#${ids.skinArm})`}
          stroke="rgba(45,30,20,0.08)"
          strokeWidth="0.5"
          d="M 14 94 Q 10 112 14 128 L 26 128 Q 22 110 24 94 Z"
        />
        <path
          fill={`url(#${ids.skinArm})`}
          stroke="rgba(45,30,20,0.08)"
          strokeWidth="0.5"
          d="M 106 94 Q 110 112 106 128 L 94 128 Q 98 110 96 94 Z"
        />

        <path
          fill={`url(#${ids.skinNeck})`}
          d="M 52 70 L 52 86 Q 60 90 68 86 L 68 70 Q 60 74 52 70 Z"
        />

        <ellipse cx="60" cy="54" rx="20" ry="22" fill={`url(#${ids.skinFace})`} />
        <ellipse cx="60" cy="66" rx="17" ry="8" fill={`url(#${ids.chinAo})`} opacity={0.35} />

        <ellipse cx="40" cy="54" rx="4.5" ry="6" fill={`url(#${ids.skinEar})`} />
        <ellipse cx="80" cy="54" rx="4.5" ry="6" fill={`url(#${ids.skinEar})`} />

        <ellipse cx="54" cy="50" rx="10" ry="11" fill={`url(#${ids.cheekHi})`} style={{ mixBlendMode: "soft-light" }} />

        <ellipse cx="52" cy="54" rx="2.6" ry="3" fill={`url(#${ids.eyeShine})`} />
        <ellipse cx="68" cy="54" rx="2.6" ry="3" fill={`url(#${ids.eyeShine})`} />
        <circle cx="52.8" cy="52.8" r="0.75" fill="white" opacity={0.65} />
        <circle cx="68.8" cy="52.8" r="0.75" fill="white" opacity={0.65} />

        <path
          d="M 52 66 Q 60 72 68 66"
          fill="none"
          stroke={`url(#${ids.mouthGrad})`}
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        <HairCap hairStyle={avatarStyle.hairStyle} fillId={ids.hairMat} />
      </g>
    </svg>
  );
}

export const CustomizableDefaultAvatar = memo(CustomizableDefaultAvatarInner);
