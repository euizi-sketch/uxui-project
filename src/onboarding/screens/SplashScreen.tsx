export default function SplashScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-100 to-white">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-violet-600" />
        <h1 className="text-3xl font-extrabold text-violet-700">육아 통합 플랫폼</h1>
        <p className="text-sm text-slate-600">아이의 성장, 매일 더 쉽게</p>
      </div>
    </div>
  );
}
