// src/Home.tsx
import React, { useState } from 'react';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* 상단 헤더 & 검색바 */}
      <div className="bg-white p-6 pb-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-900 mb-4">똑똑한 육아 탐색</h1>
        
        <div className="relative">
          <input 
            type="text"
            placeholder="어떤 제품을 찾으시나요?"
            className="w-full bg-slate-100 border-none rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-purple-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-5 top-4">🔍</span>
        </div>

        {/* 결정 지원 필터 태그 */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
          {["신뢰점수순", "전문가검증", "유해성분제로", "맘카페핫템"].map((filter) => (
            <button key={filter} className="whitespace-nowrap bg-white border border-slate-200 px-4 py-2 rounded-full text-xs font-medium text-slate-600 hover:bg-purple-50 hover:border-purple-200">
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* 상품 리스트 (아까 만든 기저귀 카드) */}
      <main className="p-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">유기농 순면 기저귀</h3>
            <span className="text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-full text-xs">신뢰 95점</span>
          </div>
          <div className="flex gap-2 mb-3">
             <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded">전문가 검증 완료</span>
             <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded">KC인증</span>
          </div>
          <p className="text-purple-600 font-bold text-lg">32,000원</p>
        </div>
      </main>
    </div>
  );
}