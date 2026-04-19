# KPI 이벤트 스키마 & 대시보드 요구사항

## 목적
- 탐색 효율, 의사결정 속도, 전환율, 신뢰 지표, UX 영향 지표를 제품 이벤트로 측정한다.
- 실험(A/B) 분석이 가능하도록 사용자 문맥과 노출 문맥을 함께 기록한다.

## 공통 이벤트 속성
- `event_name`
- `event_time` (ISO8601)
- `user_id` / `session_id`
- `device_type` (ios/android/web)
- `user_segment` (working_mom, low_digital, platform_dependent)
- `child_age_band` (0_12m, 1_3y, 4_6y, etc)
- `app_version`
- `ab_bucket` (exp_key:variant)
- `query_id` (검색 단위 추적 키)

---

## 이벤트 목록(필수)

### 탐색 효율
- `search_submitted`
  - params: `query_text`, `filter_age`, `filter_purpose`, `filter_price`
- `recommendation_rendered`
  - params: `result_count`, `render_latency_ms`, `top_item_id`
- `external_link_clicked`
  - params: `destination_channel`, `item_id`

핵심 계산:
- 평균 세션 시간 = session_end - session_start
- 상품 선택까지 클릭 수 = selection_completed 이전 click 이벤트 수
- 외부 플랫폼 비이동 해결률 = 1 - (external_link_clicked 세션 비율)
- 검색 후 첫 결과 표시 시간 = recommendation_rendered.render_latency_ms

### 의사결정 속도
- `summary_card_viewed`
  - params: `item_id`, `rank`, `scroll_depth_pct`
- `trust_panel_opened`
  - params: `item_id`, `score_band`
- `selection_completed`
  - params: `item_id`, `from_compare` (bool), `elapsed_from_search_ms`
- `same_item_researched`
  - params: `item_id`, `days_since_last_view`

핵심 계산:
- 첫 조회→선택 시간 = `selection_completed.elapsed_from_search_ms`
- 동일 상품 재검색률 = `same_item_researched users / total users`
- 비교 없이 선택 비율 = `from_compare=false` 비중
- 평균 스크롤 깊이 = `summary_card_viewed.scroll_depth_pct` 평균

### 전환율
- `cta_primary_clicked`
  - params: `item_id`, `cta_text`, `rank`
- `add_to_cart`
  - params: `item_id`, `price_band`
- `purchase_completed`
  - params: `item_id`, `amount`, `payment_type`

핵심 계산:
- 정보 조회 대비 구매 전환율 = purchase_completed / summary_card_viewed
- 주요 CTA 클릭률 = cta_primary_clicked / recommendation_rendered
- 첫 방문 전환율 = first_session_purchase / first_session_users
- 장바구니→구매 전환 = purchase_completed / add_to_cart

### 신뢰 지표
- `trust_score_shown`
  - params: `item_id`, `trust_score`, `trust_label`
- `source_detail_opened`
  - params: `item_id`, `source_count`
- `trust_feedback_submitted`
  - params: `item_id`, `is_trustworthy` (yes/no)
- `bookmark_saved`
  - params: `item_id`, `list_type`

핵심 계산:
- 신뢰 응답률 = `is_trustworthy=yes` 비율
- 출처 확인 행동 증가율 = `source_detail_opened` 추세
- 신뢰 태그 사용률 = trust_score_shown 대비 trust badge interaction
- 저장/북마크율 = bookmark_saved / recommendation_rendered

### UX 영향
- `summary_understood`
  - params: `item_id`, `understood_in_sec`
- `cognitive_load_survey_submitted`
  - params: `nasa_tlx_light_score`
- `top_rank_clicked`
  - params: `rank`

핵심 계산:
- 핵심 요약 이해 시간 = understood_in_sec 평균
- 인지 부하 변화율 = nasa_tlx_light_score 기준 전후 비교
- 상위 항목 클릭 집중도 = rank 1~3 클릭 합 / 전체 클릭

---

## 대시보드 구성

## 1. Executive KPI
- 탐색 효율 4개, 의사결정 속도 4개, 전환 4개, 신뢰 4개, UX 영향 3개
- 주간/월간 추세 + 목표 대비 달성률

## 2. 퍼널 보드
- `search_submitted -> recommendation_rendered -> summary_card_viewed -> cta_primary_clicked -> purchase_completed`
- 세그먼트별 분해: working_mom 우선 고정 뷰

## 3. 신뢰 보드
- 신뢰 점수 밴드별 전환율
- 출처 확인 행동과 전환의 상관 추세

## 4. 실험 보드
- 실험별 주요 KPI uplift와 신뢰구간
- SRM(Sample Ratio Mismatch) 경고

---

## 데이터 품질 규칙
- 필수 파라미터 누락률 1% 초과 시 경고
- `query_id` 누락 이벤트는 퍼널 제외
- 클라이언트/서버 중복 전송은 `event_id` 기준 dedupe
- 타임스탬프 역전 데이터는 별도 로그로 분리

## 집계 주기
- 실시간 모니터링: 5분
- 운영 리포트: 일 단위
- 전략 리포트: 주 단위
