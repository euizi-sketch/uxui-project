/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        /** index.css @font-face "Pretendard Variable" */
        sans: ['"Pretendard Variable"', "Pretendard", "system-ui", "sans-serif"],
      },
      keyframes: {
        /** 두 줄 복제 트랙: -50% ↔ 0% 가 같은 그림 → 끊김 없이 오른쪽으로 흐름 */
        "momo-ticker": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        /** 육아용품 상단 배너 자동 넘김 진행 바 */
        "promo-progress": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "momo-ticker": "momo-ticker 48s linear infinite",
        "promo-progress": "promo-progress 4.5s linear forwards",
      },
      maxWidth: {
        /** 모바일 앱 프레임(세로 비율) — 데스크톱에서 중앙 고정 폭 */
        app: "430px",
      },
    },
  },
  plugins: [],
};
