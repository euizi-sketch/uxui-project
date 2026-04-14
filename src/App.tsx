import React, { useState } from 'react';
import Onboarding from "./onboarding/Onboarding"; // 지금 있는 온보딩 파일

export default function App() {
  // 1. 현재 어떤 화면인지 기억해요 ('onboarding' 아니면 'home')
  const [view, setView] = useState<'onboarding' | 'home'>('onboarding');

  // 2. 온보딩이 끝났을 때 실행할 함수
  const handleFinishOnboarding = () => {
    setView('home'); // 화면을 'home'으로 바꿔라!
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {view === 'onboarding' ? (
        // 온보딩 화면을 보여주고, 끝나면 위 함수를 실행해요
        <Onboarding onComplete={handleFinishOnboarding} />
      ) : (
        // 홈 화면이 될 부분 (아직 안 만들어서 글자만 띄워요)
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold text-purple-600">🏠 홈 화면에 오신 걸 환영합니다!</h1>
          <p className="mt-2 text-gray-500">이제 여기서 검색과 필터를 만들 거예요.</p>
        </div>
      )}
    </div>
  );
}