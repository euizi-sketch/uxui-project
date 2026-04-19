import { useMemo, useState } from "react";
import { OAuthProviderMark } from "../components/OAuthProviderMark";

interface SignUpScreenProps {
  provider: "kakao" | "naver" | "apple" | "google" | null;
  agreedToTerms: boolean;
  onSelectProvider: (provider: "kakao" | "naver" | "apple" | "google") => void;
  onSetAgreedToTerms: (value: boolean) => void;
}

export default function SignUpScreen({
  provider,
  agreedToTerms,
  onSelectProvider,
  onSetAgreedToTerms,
}: SignUpScreenProps) {
  const [termsOpen, setTermsOpen] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const providerLabel = useMemo(() => {
    switch (provider) {
      case "kakao":
        return "Kakao";
      case "naver":
        return "Naver";
      case "apple":
        return "Apple";
      case "google":
        return "Google";
      default:
        return "";
    }
  }, [provider]);

  const headerTitle = useMemo(() => {
    if (!provider) return "";
    if (provider === "kakao" || provider === "naver") return `${providerLabel}계정으로 로그인`;
    return `${providerLabel}로 로그인`;
  }, [provider, providerLabel]);

  const detailTitle = useMemo(() => {
    switch (provider) {
      case "kakao":
        return "카카오 개인정보 제3자 제공 동의 안내";
      case "naver":
        return "네이버 개인정보 제3자 제공 동의 안내";
      case "apple":
        return "Apple 개인정보 제3자 제공 동의 안내";
      case "google":
        return "Google 개인정보 제3자 제공 동의 안내";
      default:
        return "";
    }
  }, [provider]);

  const oauthBtnBase =
    "flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition";

  const confirmButtonClassName = useMemo(() => {
    switch (provider) {
      case "kakao":
        return "bg-[#FEE500] text-[#191919] hover:brightness-95";
      case "naver":
        return "bg-[#03C75A] text-white hover:brightness-95";
      case "apple":
        return "bg-black text-white hover:brightness-110";
      case "google":
        return "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50";
      default:
        return "bg-[#FF853E] text-white hover:bg-[#FF6F1F]";
    }
  }, [provider]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => onSelectProvider("kakao")}
          className={`${oauthBtnBase} bg-[#FEE500] text-[#191919] hover:brightness-95 ${
            provider === "kakao" ? "ring-2 ring-[#FF853E]" : ""
          }`}
        >
          <OAuthProviderMark provider="kakao" className="h-5 w-5 shrink-0 text-[#191919]" aria-hidden />
          <span>Kakao로 시작하기</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectProvider("naver")}
          className={`${oauthBtnBase} bg-[#03C75A] text-white hover:brightness-95 ${
            provider === "naver" ? "ring-2 ring-[#FF853E]" : ""
          }`}
        >
          <OAuthProviderMark provider="naver" className="h-4 w-4 shrink-0 text-white" aria-hidden />
          <span>Naver로 시작하기</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectProvider("apple")}
          className={`${oauthBtnBase} bg-black text-white hover:brightness-110 ${
            provider === "apple" ? "ring-2 ring-[#FF853E]" : ""
          }`}
        >
          <OAuthProviderMark provider="apple" className="h-5 w-5 shrink-0 text-white" aria-hidden />
          <span>Apple로 시작하기</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectProvider("google")}
          className={`${oauthBtnBase} border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 ${
            provider === "google" ? "ring-2 ring-[#FF853E]" : ""
          }`}
        >
          <OAuthProviderMark provider="google" className="h-5 w-5 shrink-0" aria-hidden />
          <span>Google로 시작하기</span>
        </button>
      </div>

      {provider && (
        <button
          type="button"
          onClick={() => setTermsOpen(true)}
          className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
            agreedToTerms
              ? "border-[#FF853E] bg-[#FFF1EA]"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div>
            <p className="text-sm font-medium text-slate-800">[필수] 약관 동의</p>
            <p className="mt-1 text-xs text-slate-600">
              약관 및 개인정보 처리방침에 동의해 주세요.
            </p>
          </div>
          <span
            className={`ml-4 inline-flex h-6 w-6 items-center justify-center rounded-full border text-sm font-bold ${
              agreedToTerms
                ? "border-[#FF853E] bg-[#FF853E] text-white"
                : "border-slate-300 bg-white text-slate-400"
            }`}
          >
            ✓
          </span>
        </button>
      )}

      {termsOpen && provider && (
        <div className="app-viewport-fixed z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm">
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="text-sm font-semibold text-slate-900">{headerTitle}</div>
              <button
                type="button"
                onClick={() => setTermsOpen(false)}
                className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 px-4 py-5">
              <div className="flex h-20 items-center justify-center rounded-xl bg-slate-50">
                <OAuthProviderMark
                  provider={provider}
                  className={
                    provider === "kakao"
                      ? "h-10 w-10 text-[#191919]"
                      : provider === "naver"
                        ? "h-9 w-9 text-[#03C75A]"
                        : provider === "apple"
                          ? "h-10 w-10 text-slate-900"
                          : "h-10 w-10"
                  }
                />
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-800">
                  {providerLabel} 로그인 동의
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  서비스 제공을 위해 회원번호와 함께 개인정보가 제공됩니다. 자세한
                  내용은 동의 내용에서 확인할 수 있습니다.
                </p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <button
                      type="button"
                      onClick={() => setAllChecked((prev) => !prev)}
                      className={`inline-flex h-4 w-4 items-center justify-center rounded border text-[10px] font-bold transition ${
                        allChecked
                          ? "border-[#FF853E] bg-[#FF853E] text-white"
                          : "border-slate-300 bg-white text-slate-400 hover:border-slate-400"
                      }`}
                      aria-label="필수 항목 동의 체크"
                    >
                      ✓
                    </button>
                    <span>[필수] 개인정보 제공 동의</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailOpen(true)}
                    className="font-normal text-slate-500"
                  >
                    보기
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={!allChecked}
                onClick={() => {
                  onSetAgreedToTerms(true);
                  setDetailOpen(false);
                  setTermsOpen(false);
                }}
                className="h-12 w-full rounded-xl bg-[#FF853E] px-4 text-sm font-semibold text-white transition hover:bg-[#FF6F1F] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                동의하고 계속하기
              </button>
            </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onSetAgreedToTerms(false);
                setDetailOpen(false);
                setTermsOpen(false);
              }}
              className="mt-4 w-full py-2 text-center text-sm font-semibold text-white/80 transition hover:text-white"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {termsOpen && provider && detailOpen && (
        <div className="app-viewport-fixed z-[60] overflow-y-auto bg-white">
          <div className="mx-auto flex h-full w-full max-w-md flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="text-base font-semibold text-slate-900">
                {detailTitle}
              </div>
              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 text-sm text-slate-700">
              <p className="leading-6 text-slate-600">
                서비스 제공을 위해 회원관리 및 서비스 제공에 필요한 개인정보가
                제공됩니다. 동의 철회 또는 서비스 탈퇴 시 지체없이 파기됩니다.
              </p>

              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <p className="font-semibold text-slate-900">[제공 하는 자]</p>
                  <p className="text-slate-700">
                    {provider === "kakao"
                      ? "카카오"
                      : provider === "naver"
                        ? "네이버"
                        : provider === "apple"
                          ? "Apple"
                          : "Google"}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-slate-900">[제공 받는 자]</p>
                  <p className="text-slate-700">모모아</p>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="space-y-3">
                  <p className="font-semibold text-slate-900">[필수 제공 항목]</p>
                  <p className="leading-6 text-slate-600">
                    닉네임, 계정(이메일), 성별, 계정(전화번호), 출생 연도, 생일 등
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-slate-900">[제공 목적]</p>
                  <p className="leading-6 text-slate-600">
                    서비스 내 이용자 식별, 회원관리 및 서비스 제공
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-slate-900">[보유 기간]</p>
                  <p className="leading-6 text-slate-600">
                    동의 철회 또는 서비스 탈퇴 시 지체없이 파기
                  </p>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="space-y-3">
                  <p className="font-semibold text-slate-900">[필수 제공 항목]</p>
                  <p className="leading-6 text-slate-600">CI(연계정보)</p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-slate-900">[제공 목적]</p>
                  <p className="leading-6 text-slate-600">회원 비교식별</p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-slate-900">[보유 기간]</p>
                  <p className="leading-6 text-slate-600">
                    제공목적 달성 후 지체없이 파기
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className={`h-12 w-full rounded-xl px-4 text-sm font-semibold transition ${confirmButtonClassName}`}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

