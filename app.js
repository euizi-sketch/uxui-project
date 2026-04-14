const catalog = [
  {
    id: "p1",
    name: "베이비 수딩 크림 A",
    age: "1-3y",
    purpose: "soothing",
    price: "mid",
    pros: ["진정 속도가 빠름", "무향에 가까움", "흡수가 가벼움"],
    cons: ["건성에는 보습감 약함", "용량 대비 가격 보통"],
    target: "외출 후 붉어짐이 잦은 아이",
    source: { expert: 4, verified: 35, community: 20, blog: 8, ad: 4 },
    usage: { verifiedRatio: 0.72, durationRatio: 0.58, evidenceRatio: 0.65, quality: 2.4 },
    consistency: 0.84,
    recency: { p1: 0.31, p3: 0.37, p6: 0.2, pOld: 0.12 },
    risk: { sponsor: 1, promo: 0.8, dup: 0.2, bias: 0.2 }
  },
  {
    id: "p2",
    name: "데일리 보습 로션 B",
    age: "0-12m",
    purpose: "moisture",
    price: "low",
    pros: ["대용량 가성비 좋음", "펌프형으로 사용 편함", "보습 지속이 안정적"],
    cons: ["여름철엔 다소 무거움", "향 선호가 갈림"],
    target: "아침 준비 시간이 부족한 워킹맘",
    source: { expert: 2, verified: 41, community: 19, blog: 11, ad: 6 },
    usage: { verifiedRatio: 0.75, durationRatio: 0.62, evidenceRatio: 0.58, quality: 2.1 },
    consistency: 0.78,
    recency: { p1: 0.28, p3: 0.32, p6: 0.21, pOld: 0.19 },
    risk: { sponsor: 1.3, promo: 1.1, dup: 0.3, bias: 0.2 }
  },
  {
    id: "p3",
    name: "아웃도어 프로텍트 밤 C",
    age: "4-6y",
    purpose: "outdoor",
    price: "high",
    pros: ["야외활동 보호에 강함", "재도포 간격이 김", "휴대가 간편함"],
    cons: ["가격대가 높음", "민감 피부는 테스트 권장"],
    target: "주말 야외활동이 잦은 가정",
    source: { expert: 5, verified: 24, community: 15, blog: 7, ad: 3 },
    usage: { verifiedRatio: 0.68, durationRatio: 0.51, evidenceRatio: 0.61, quality: 2.6 },
    consistency: 0.81,
    recency: { p1: 0.33, p3: 0.34, p6: 0.18, pOld: 0.15 },
    risk: { sponsor: 0.8, promo: 0.9, dup: 0.3, bias: 0.1 }
  }
];

let selected = null;
let currentResults = [];

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function calcTrust(item) {
  const sData = item.source;
  const totalN = sData.expert + sData.verified + sData.community + sData.blog + sData.ad;
  const weighted =
    1.0 * sData.expert +
    0.85 * sData.verified +
    0.7 * sData.community +
    0.55 * sData.blog +
    0.3 * sData.ad;
  let S = 30 * (weighted / totalN);
  const sourceKinds = ["expert", "verified", "community", "blog", "ad"].filter((k) => sData[k] > 0).length;
  if (sourceKinds >= 3) S += 2;
  const dominantRatio = Math.max(
    sData.expert / totalN,
    sData.verified / totalN,
    sData.community / totalN,
    sData.blog / totalN,
    sData.ad / totalN
  );
  if (dominantRatio > 0.8) S -= 2;

  const u = item.usage;
  const E = u.verifiedRatio * 10 + u.durationRatio * 6 + u.evidenceRatio * 6 + u.quality;
  const C = 20 * item.consistency;

  const r = item.recency;
  let R = 15 * (1.0 * r.p1 + 0.8 * r.p3 + 0.5 * r.p6 + 0.2 * r.pOld);
  if (r.p1 + r.p3 >= 0.6) R += 1;
  if (r.p1 + r.p3 + r.p6 < 0.2) R -= 2;

  const k = item.risk;
  const A = k.sponsor + k.promo + k.dup + k.bias;

  const score = Math.round(clamp(S + E + C + R - A, 0, 100));
  return { score, S: S.toFixed(1), E: E.toFixed(1), C: C.toFixed(1), R: R.toFixed(1), A: A.toFixed(1) };
}

function scoreLabel(score) {
  if (score >= 90) return "매우 신뢰";
  if (score >= 75) return "신뢰";
  if (score >= 60) return "보통";
  if (score >= 45) return "주의 필요";
  return "신뢰 낮음";
}

function decisionLabel(score) {
  return score >= 75 ? "지금 사도 됨" : "조건부 추천";
}

function trustReason(item, trust) {
  const sourceCount = item.source.expert + item.source.verified + item.source.community + item.source.blog + item.source.ad;
  const recentRatio = Math.round((item.recency.p1 + item.recency.p3) * 100);
  return `출처 ${sourceCount}건, 최근 3개월 ${recentRatio}% 반영으로 ${trust.score}점입니다.`;
}

function matchIntentTags(item) {
  const ageMap = { "0-12m": "0~12개월", "1-3y": "1~3세", "4-6y": "4~6세" };
  const purposeMap = { moisture: "보습", soothing: "진정", outdoor: "야외활동" };
  const priceMap = { low: "저가", mid: "중가", high: "고가" };
  return `${ageMap[item.age]} / ${purposeMap[item.purpose]} / ${priceMap[item.price]}`;
}

function renderCompare(items) {
  const wrap = document.getElementById("compareTable");
  if (!items.length) {
    wrap.innerHTML = "<p class='empty'>조건에 맞는 결과가 없습니다.</p>";
    return;
  }

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>항목</th>
          ${items.map((i) => `<th>${i.name}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>신뢰 점수</td>
          ${items.map((i) => `<td>${calcTrust(i).score} (${scoreLabel(calcTrust(i).score)})</td>`).join("")}
        </tr>
        <tr>
          <td>추천 대상</td>
          ${items.map((i) => `<td>${i.target}</td>`).join("")}
        </tr>
        <tr>
          <td>장점 3</td>
          ${items.map((i) => `<td>${i.pros.join(", ")}</td>`).join("")}
        </tr>
        <tr>
          <td>단점 2</td>
          ${items.map((i) => `<td>${i.cons.join(", ")}</td>`).join("")}
        </tr>
      </tbody>
    </table>
  `;
}

function renderList(items, query) {
  const list = document.getElementById("recommendList");
  const resultMeta = document.getElementById("resultMeta");
  const topConclusion = document.getElementById("topConclusion");
  list.innerHTML = "";
  resultMeta.textContent = `"${query || "전체"}" 기준 추천 ${items.length}개`;

  if (!items.length) {
    topConclusion.textContent = "조건에 맞는 결과가 없습니다. 필터를 넓혀 다시 시도해 주세요.";
    list.innerHTML = "<p class='empty'>추천 결과가 없습니다.</p>";
    renderCompare([]);
    return;
  }

  const best = items[0];
  const bestTrust = calcTrust(best);
  topConclusion.textContent = `베스트 1: ${best.name} · ${bestTrust.score}점(${scoreLabel(bestTrust.score)}) — 이 제품이면 충분합니다.`;

  items.slice(0, 3).forEach((item, idx) => {
    const trust = calcTrust(item);
    const div = document.createElement("article");
    div.className = "item";
    div.innerHTML = `
      <span class="badge">Top ${idx + 1}</span>
      <span class="decision-chip">${decisionLabel(trust.score)}</span>
      <h3>${item.name}</h3>
      <div class="meta strong">한 줄 결론: ${item.target}에게 특히 적합</div>
      <div class="meta">신뢰 점수 ${trust.score} (${scoreLabel(trust.score)}) · 검증 완료</div>
      <div class="meta">장점 3: ${item.pros.join(" · ")}</div>
      <div class="meta">단점 2: ${item.cons.join(" · ")}</div>
      <div class="meta">신뢰 근거: 출처 ${item.source.expert + item.source.verified + item.source.community + item.source.blog + item.source.ad}건 · 실사용 ${(item.usage.verifiedRatio * 100).toFixed(0)}% · 최근성 ${((item.recency.p1 + item.recency.p3) * 100).toFixed(0)}%</div>
      <div class="meta">맞춤 태그: ${matchIntentTags(item)}</div>
      <div class="row">
        <button data-id="${item.id}" class="choose-btn">이걸로 결정하기</button>
        <button data-id="${item.id}" class="trust-btn">근거 보기</button>
      </div>
    `;
    list.appendChild(div);
  });

  renderCompare(items.slice(0, 3));

  document.querySelectorAll(".choose-btn").forEach((btn) => {
    btn.addEventListener("click", () => chooseItem(btn.dataset.id));
  });
  document.querySelectorAll(".trust-btn").forEach((btn) => {
    btn.addEventListener("click", () => openTrust(btn.dataset.id));
  });
}

function chooseItem(id) {
  selected = catalog.find((x) => x.id === id) || null;
  const text = document.getElementById("decisionCopy");
  const decideBtn = document.getElementById("decideBtn");
  const saveBtn = document.getElementById("saveBtn");
  const status = document.getElementById("statusText");

  if (!selected) return;
  const trust = calcTrust(selected);
  text.textContent = `${selected.name} 선택됨 · ${trust.score}점(${scoreLabel(trust.score)}) · 유사 프로필 선택률 74%`;
  decideBtn.disabled = false;
  saveBtn.disabled = false;
  status.textContent = "";
}

function openTrust(id) {
  const item = catalog.find((x) => x.id === id);
  if (!item) return;
  const trust = calcTrust(item);
  const content = document.getElementById("trustContent");
  const sourceCount = item.source.expert + item.source.verified + item.source.community + item.source.blog + item.source.ad;
  content.innerHTML = `
    <p><b>${item.name}</b></p>
    <p>신뢰 점수: <b>${trust.score}</b>점 (${scoreLabel(trust.score)}) · <span class="verified-mark">검증 완료</span></p>
    <p>${trustReason(item, trust)}</p>
    <p>점수 구성: 출처 ${trust.S} + 실사용 ${trust.E} + 일관성 ${trust.C} + 최신성 ${trust.R} - 광고리스크 ${trust.A}</p>
    <p>출처 상세: 전문가 ${item.source.expert} · 실구매 ${item.source.verified} · 커뮤니티 ${item.source.community} · 블로그 ${item.source.blog} · 광고성 ${item.source.ad}</p>
    <p>원문 보기: 커뮤니티/전문가/공식 데이터 요약 제공</p>
  `;
  document.getElementById("trustDialog").showModal();
}

function applySearch() {
  const query = document.getElementById("queryInput").value.trim();
  const age = document.getElementById("ageFilter").value;
  const purpose = document.getElementById("purposeFilter").value;
  const price = document.getElementById("priceFilter").value;

  let items = catalog.filter((item) => {
    const passAge = age === "all" || item.age === age;
    const passPurpose = purpose === "all" || item.purpose === purpose;
    const passPrice = price === "all" || item.price === price;
    const passQuery = !query || item.name.includes(query) || item.target.includes(query);
    return passAge && passPurpose && passPrice && passQuery;
  });

  items = items.sort((a, b) => calcTrust(b).score - calcTrust(a).score);
  currentResults = items;
  showScreen("result");
  renderList(items, query);
}

function showScreen(tab) {
  const home = document.getElementById("homeScreen");
  const result = document.getElementById("resultScreen");
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tab || (tab === "result" && btn.dataset.tab === "recommend"));
  });

  if (tab === "result" || tab === "recommend") {
    home.classList.add("hidden");
    result.classList.remove("hidden");
  } else {
    home.classList.remove("hidden");
    result.classList.add("hidden");
  }
}

document.getElementById("searchBtn").addEventListener("click", applySearch);
document.querySelectorAll(".tag-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.getElementById("queryInput").value = btn.dataset.query;
    applySearch();
  });
});
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.tab === "recommend") {
      showScreen("result");
      if (!currentResults.length) renderList(catalog.sort((a, b) => calcTrust(b).score - calcTrust(a).score), "전체");
      return;
    }
    showScreen("search");
  });
});
document.getElementById("decideBtn").addEventListener("click", () => {
  const status = document.getElementById("statusText");
  status.textContent = selected ? `${selected.name} 구매/행동 완료로 기록되었습니다. 선택 시간이 단축되었습니다.` : "";
});
document.getElementById("saveBtn").addEventListener("click", () => {
  const status = document.getElementById("statusText");
  status.textContent = selected ? `${selected.name} 저장 완료. 나중에 다시 볼 수 있어요.` : "";
});

showScreen("search");
