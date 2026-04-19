export default function SplashScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#FF853E]">
      <div className="flex w-full max-w-sm flex-col items-center space-y-4 px-4 text-center">
        <img
          src="/app-icon-transparent.png"
          alt="앱 아이콘"
          width={151}
          height={151}
          decoding="async"
          fetchPriority="high"
          className="h-[151px] w-[151px] shrink-0 object-contain brightness-0 invert drop-shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
        />
        <p className="min-h-[3.25rem] w-full max-w-[min(100%,20rem)] text-pretty px-2 text-base font-medium leading-snug text-white [text-rendering:geometricPrecision]">
          여기저기 찾지 말고, 한곳에서
        </p>
      </div>
    </div>
  );
}
