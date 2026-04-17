import { useMemo, useState } from "react";
import { searchKoreaAdminAddressLines } from "../../data/koreaNeighborhoods";
import InputField from "../components/common/InputField";
import type { IncomeBracket, ProfileInput } from "../types";

interface ProfileFormProps {
  profile: ProfileInput;
  errors: Partial<
    Pick<ProfileInput, "nickname" | "phone1" | "phone2" | "phone3" | "addressSearch" | "addressDetail">
  > & { phone?: string };
  onChange: <K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) => void;
}

export default function ProfileForm({ profile, errors, onChange }: ProfileFormProps) {
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");
  const [addressCommittedQuery, setAddressCommittedQuery] = useState("");

  const addressResults = useMemo(() => {
    const q = addressCommittedQuery.trim();
    if (!q) return [];
    /** 전국 시·도 / 시·군·구 / 동·읍·면 조합 검색 (`sigungu` 데이터, 도로명 주소 아님) */
    return searchKoreaAdminAddressLines(q);
  }, [addressCommittedQuery]);

  return (
    <div className="space-y-4">
      <InputField
        label="부모/보호자 닉네임"
        value={profile.nickname}
        onChange={(e) => onChange("nickname", e.target.value)}
        error={errors.nickname}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">휴대전화 (아이디·비밀번호 찾기)</p>
        <div className="flex min-w-0 gap-2">
          <select
            value={profile.phone1}
            onChange={(e) => onChange("phone1", e.target.value)}
            className="h-11 w-20 flex-none rounded-xl border border-slate-300 bg-white px-2 text-sm outline-none transition focus:border-[#FF853E]"
          >
            <option value="010">010</option>
            <option value="011">011</option>
            <option value="016">016</option>
            <option value="017">017</option>
            <option value="018">018</option>
            <option value="019">019</option>
          </select>
          <input
            value={profile.phone2}
            onChange={(e) => onChange("phone2", e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-[#FF853E]"
            inputMode="numeric"
            placeholder="0000"
          />
          <input
            value={profile.phone3}
            onChange={(e) => onChange("phone3", e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-[#FF853E]"
            inputMode="numeric"
            placeholder="0000"
          />
        </div>
        {errors.phone && <p className="text-xs text-rose-500">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">주소 검색</p>
        <div className="flex gap-2">
          <input
            value={profile.addressSearch}
            readOnly
            placeholder="예: 서울특별시 강남구 ..."
            onClick={() => {
              setAddressQuery(profile.addressSearch);
              setAddressCommittedQuery("");
              setAddressModalOpen(true);
            }}
            className={`h-11 w-full flex-1 rounded-xl border px-3 text-sm outline-none transition focus:border-[#FF853E] ${
              errors.addressSearch ? "border-rose-400" : "border-slate-300"
            }`}
          />
          <button
            type="button"
            onClick={() => {
              setAddressQuery(profile.addressSearch);
              setAddressCommittedQuery("");
              setAddressModalOpen(true);
            }}
            className="h-11 w-11 flex-none rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
            aria-label="주소 검색"
            title="주소 검색"
          >
            🔍
          </button>
        </div>
        {errors.addressSearch && (
          <p className="text-xs text-rose-500">{errors.addressSearch}</p>
        )}
      </div>
      <InputField
        label="상세주소"
        placeholder="예: 101동 1001호"
        value={profile.addressDetail}
        onChange={(e) => onChange("addressDetail", e.target.value)}
        error={errors.addressDetail}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">월 가구 소득 (선택)</p>
        <div className="space-y-1 text-[11px] font-medium leading-relaxed text-slate-500">
          <p>입력하신 것을 토대로 육아용품 탭에서</p>
          <p>그에 맞는 가격대가 먼저 보이도록 순서를 조정해 드려요.</p>
          <p>부담이 되시면 비워 두셔도 괜찮아요.</p>
          <p>그때는 가격은 따로 가리지 않고, 무난하게 추천해 드릴게요.</p>
        </div>
        <select
          value={profile.incomeBracket}
          onChange={(e) => onChange("incomeBracket", e.target.value as IncomeBracket)}
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-[#FF853E]"
        >
          <option value="">선택 안 함 · 비공개</option>
          <option value="lt400">월 400만원 미만</option>
          <option value="400to700">월 400만원 ~ 700만원</option>
          <option value="700to1000">월 700만원 ~ 1,000만원</option>
          <option value="gte1000">월 1,000만원 이상</option>
        </select>
      </div>

      {addressModalOpen && (
        <div className="app-viewport-fixed z-[80] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="text-base font-semibold text-slate-900">주소 검색</div>
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 px-5 py-4">
              <div className="flex gap-2">
                <input
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setAddressCommittedQuery(addressQuery);
                  }}
                  placeholder="예: 서울 강남구 역삼동 · 충청남도 천안시"
                  className="h-11 w-full flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-[#FF853E]"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setAddressCommittedQuery(addressQuery)}
                  className="h-11 flex-none rounded-xl bg-[#FF853E] px-4 text-sm font-semibold text-white transition hover:bg-[#FF6F1F]"
                >
                  검색
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200">
                {addressCommittedQuery.trim().length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-400">
                    검색어를 입력하고 검색을 눌러주세요.
                  </div>
                ) : addressResults.length > 0 ? (
                  addressResults.map((addr) => (
                    <button
                      key={addr}
                      type="button"
                      onClick={() => {
                        onChange("addressSearch", addr);
                        setAddressQuery(addr);
                        setAddressCommittedQuery(addr);
                        setAddressModalOpen(false);
                      }}
                      className="flex w-full items-start gap-2 border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 last:border-b-0"
                    >
                      <span className="mt-0.5 text-slate-400">📍</span>
                      <span>{addr}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-slate-400">
                    검색 결과가 없어요.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="h-11 w-full rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
