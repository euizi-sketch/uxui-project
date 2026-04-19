import { useState } from "react";
import { loadStoredAccount } from "../profile/accountCredentialsStorage";
import { DEVICE_DATA_RETAINED_AFTER_LOGOUT, logoutLocalSession } from "./accountActions";

export default function LogoutFlowPanel({
  onBack,
  nicknameHint,
}: {
  onBack: () => void;
  nicknameHint: string;
}) {
  const acc = loadStoredAccount();
  const [agreed, setAgreed] = useState(false);
  const [password, setPassword] = useState("");

  const needsPassword = Boolean(acc);
  const passwordOk = !needsPassword || password === acc?.password;
  const canSubmit = agreed && passwordOk && (!needsPassword || password.length > 0);

  const handleLogout = () => {
    if (!agreed) return;
    if (needsPassword && password !== acc?.password) {
      window.alert("비밀번호가 일치하지 않아요.");
      return;
    }
    logoutLocalSession();
    window.alert(
      "로그아웃했어요.\n저장된 회원 정보와 로그인 정보는 그대로입니다.\n앱을 다시 열면 로그인 화면이 나오며, 같은 아이디로 로그인하면 이전처럼 이용할 수 있어요."
    );
    window.location.reload();
  };

  return (
    <div className="border-t border-slate-200 px-5 py-6">
      <p className="text-[13px] font-medium leading-relaxed text-slate-600">
        로그아웃하면 <span className="font-bold text-slate-800">로그인 세션만 종료</span>합니다. 회원 정보·저장된
        아이디·비밀번호·프로필·주문 내역 등은 이 기기에 그대로 남으며, 같은 계정으로 다시 로그인하면{" "}
        <span className="font-bold text-slate-800">이전과 동일하게</span> 이용할 수 있습니다.
      </p>

      {nicknameHint ? (
        <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-[13px] font-semibold text-slate-800">
          현재 로그인(저장) 정보: <span className="text-[#FF853E]">{nicknameHint}</span>
        </p>
      ) : null}

      <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">로그아웃 후에도 유지</p>
      <ul className="mt-2 space-y-3">
        {DEVICE_DATA_RETAINED_AFTER_LOGOUT.map((row) => (
          <li key={row.title} className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 py-3">
            <span className="mt-0.5 text-emerald-600" aria-hidden>
              ✓
            </span>
            <div>
              <p className="text-[13px] font-bold text-slate-900">{row.title}</p>
              <p className="mt-0.5 text-[12px] font-medium leading-relaxed text-slate-600">{row.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-[#FF853E] focus:ring-[#FF853E]"
        />
        <span className="text-[13px] font-medium leading-relaxed text-slate-700">
          위 내용을 확인했으며, 세션만 종료하고 로그아웃합니다.
        </span>
      </label>

      {needsPassword ? (
        <label className="mt-5 block">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            비밀번호 확인
          </span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="가입 시 설정한 비밀번호"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] font-medium outline-none focus:border-[#FFB089] focus:ring-2 focus:ring-[#FF853E]/20"
          />
          <p className="mt-1.5 text-[11px] font-medium text-slate-400">
            데모에서 로컬에 저장된 계정만 검증합니다.
          </p>
        </label>
      ) : (
        <p className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-[12px] font-medium text-sky-900">
          이 기기에는 비밀번호형 로컬 계정이 없어요. 확인만으로 로그아웃할 수 있어요.
        </p>
      )}

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-sm font-bold text-slate-700"
        >
          취소
        </button>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleLogout}
          className="flex-1 rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
