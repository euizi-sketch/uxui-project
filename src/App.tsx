import React, { useState } from 'react';
import Onboarding from "./onboarding/Onboarding";

// 1. 제품 사진과 검색창이 있는 진짜 홈 화면
function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // 기획하신 컨셉에 맞춘 샘플 데이터들
  const products = [
    { 
      id: 1, 
      name: "유기농 순면 기저귀 A형", 
      price: "32,000", 
      score: 95, 
      tag: "전문가 검증",
      imageUrl: "https://images.unsplash.com/photo-1544126592-807daa2b5d33?w=300&q=80"
    },
    { 
      id: 2, 
      name: "친환경 대나무 물티슈", 
      price: "15,800", 
      score: 88, 
      tag: "인기 급상승",
      imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&q=80"
    },
    { 
      id: 3, 
      name: "무독성 실리콘 치발기", 
      price: "12,000", 
      score: 92, 
      tag: "KC인증 완료",
      imageUrl: "https://images.unsplash.com/photo-1532210317175-013d482c7e91?w=300&q=80"
    },
  ];

  const filteredProducts = products.filter(p => p.name.includes(searchTerm));

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen p-6 font-sans">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-4 text-center">똑똑한 육아 탐색 👶</h1>
        <div className="relative">
          <input 
            type="text" 
            placeholder="제품명을 검색해보세요"
            className="w-full p-4 bg-white rounded-2xl shadow-sm border-none focus:ring-2 focus:ring-purple-400 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-5 top-4 text-slate-400">🔍</span>
        </div>
      </header>
      
      <div className="space-y-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-50 flex gap-4 items-center hover:shadow-md transition-shadow">
              {/* 제품 사진 영역 */}
              <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              </div>

              {/* 정보 영역 */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-800 text-sm leading-tight">{product.name}</h3>
                  <span className="text-purple-600 font-bold text-[10px] bg-purple-50 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">신뢰 {product.score}점</span>
                </div>
                <p className="text-blue-600 text-[10px] font-semibold mb-2">{product.tag}</p>
                <p className="font-extrabold text-slate-900">{product.price}원</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-400 mt-10">검색 결과가 없어요. 😢</p>
        )}
      </div>
    </div>
  );
}

// 2. 메인 App 컴포넌트 (온보딩 포함)
export default function App() {
  const [view, setView] = useState<'onboarding' | 'home'>('onboarding');

  const handleFinishOnboarding = () => {
    setView('home'); 
  };

  return (
    <div className="min-h-screen bg-white">
      {view === 'onboarding' ? (
        <Onboarding onComplete={handleFinishOnboarding} />
      ) : (
        <Home /> 
      )}
    </div>
  );
}