import { useId } from "react";

type Props = {
  className?: string;
};

/** 엄마들이 모여 있는 커뮤니티 느낌의 입체형 일러스트 아이콘 */
export function MomCommunityIcon({ className }: Props) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`face-${uid}`} x1="25%" y1="0%" x2="75%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#FFE8DC" />
          <stop offset="100%" stopColor="#FFCDB2" />
        </linearGradient>
        <linearGradient id={`heart-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
        <radialGradient id={`halo-${uid}`} cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#FFE8DC" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </radialGradient>
        <filter id={`lift-${uid}`} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.8" floodColor="#F97316" floodOpacity="0.22" />
          <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor="#0f172a" floodOpacity="0.07" />
        </filter>
      </defs>

      <circle cx="50" cy="48" r="40" fill={`url(#halo-${uid})`} />

      <ellipse cx="50" cy="86" rx="32" ry="8" fill="#F97316" fillOpacity="0.14" />

      <g filter={`url(#lift-${uid})`}>
        <circle cx="32" cy="50" r="16" fill={`url(#face-${uid})`} stroke="#FDBA74" strokeWidth="1.2" />
        <circle cx="50" cy="46" r="18" fill={`url(#face-${uid})`} stroke="#FB923C" strokeWidth="1.3" />
        <circle cx="68" cy="50" r="16" fill={`url(#face-${uid})`} stroke="#FDBA74" strokeWidth="1.2" />

        <ellipse cx="27" cy="44" rx="5" ry="3" fill="white" fillOpacity="0.88" />
        <ellipse cx="45" cy="40" rx="6" ry="3.5" fill="white" fillOpacity="0.92" />
        <ellipse cx="63" cy="44" rx="5" ry="3" fill="white" fillOpacity="0.88" />

        <path
          d="M24 54 Q30 58 36 54"
          stroke="#D97757"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M43 52 Q50 57 57 52"
          stroke="#9A3412"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M64 54 Q70 58 76 54"
          stroke="#D97757"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </g>

      <path
        d="M50 11c-3.5-3.2-9-1.5-9 3 0 3.5 4 6.5 9 11 5-4.5 9-7.5 9-11 0-4.5-5.5-6.2-9-3z"
        fill={`url(#heart-${uid})`}
        stroke="#FFF5EF"
        strokeWidth="0.7"
        filter={`url(#lift-${uid})`}
      />
      <ellipse cx="50" cy="13" rx="3.5" ry="1.8" fill="white" fillOpacity="0.5" />

      <path
        d="M41 64 Q50 71 59 64"
        stroke="#F97316"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}
