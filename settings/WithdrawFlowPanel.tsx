import { useState } from "react";
import { loadStoredAccount } from "../profile/accountCredentialsStorage";
import { endLocalSession, LOCAL_DATA_CATEGORIES } from "./accountActions";

const WITHDRAW_REASONS = [
  { id: "privacy", label: "개인정보·보안 우려" },
  { id: "unused", label: "서비스를 잘 사용하지 않음" },
  { id: "duplicate", label: "다른 계정으로 이용 예정" },
  { id: "experience", label: "서비스 이용이 불편함" },
  { id: "other", label: "기타" },
] as const;

export default function WithdrawFlowPanel({
  onBack,
  nicknameHint,
}: {
  onBack: () => void;
  nicknameHint: string;
}) {
  const acc = loadStoredAccount();
  const [reason, setReason] = useState<(typeof WITHDRAW_REASONS)[number]["id"]>("unused");
  const [agreeDelete, setAgreeDelete] = useState(false);
  const [agreeFinal, setAgreeFinal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");

  const needsPassword = Boolean(acc);
  const confirmOk = confirmText.trim() === "탈퇴";
  const passwordOk = !needsPassword || password === acc?.password;
  const canSubmit =
    agreeDelete && agreeFinal && confirmOk && passwordOk && (!needsPassword || password.length > 0);

  const handleWithdraw = () => {
    if (!agreeDelete || !agreeFinal || !confirmOk) return;
    if (needsPassword && password !== acc?.password) {
      window.alert("비밀번호가 일치하지 않아요.");
      return;
    }
    const n = endLocalSession();
    window.alert(
      `회원 탈퇴 처리했어요.\n탈퇴 사유(데모): ${WITHDRAW_REASONS.find((r) => r.id === reason)?.label ?? reason}\n삭제된 로컬 저장 키: 약 ${n}건\n같은 브라우저에서는 처음부터 다시 가입·이용할 수 있어요.`
    );
    window.location.reload();
  };

  return (
    <div className="border-t border-slate-200 px-5 py-6">
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
        <p className="text-[13px] font-bold text-rose-900">회원 탈퇴 전 꼭 읽어 주세요</p>
        <p className="mt-2 text-[12px] font-medium leading-relaxed text-rose-950/90">
          탈퇴 후에는 <span className="font-bold">계정 복구·데이터 복원이 불가</span>합니다. 데모 앱은 서버가
          없어 이 기기의 저장 데이터만 삭제되며, 실제 서비스에서는 탈퇴 후 일정 기간 보관 정책이 적용될 수
          있어요.
        </p>
      </div>

      {nicknameHint ? (
        <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-[13px] font-semibold text-slate-800">
          탈퇴 대상: <span className="text-[#FF853E]">{nicknameHint}</span>
        </p>
      ) : null}

      <p className="mt-5 text-[12px] font-bold uppercase tracking-wide text-slate-500">삭제되는 데이터</p>
      <ul className="mt-2 space-y-2">
        {LOCAL_DATA_CATEGORIES.map((row) => (
          <li key={row.title} className="text-[12px] font-medium text-slate-600">
            · <span className="font-semibold text-slate-800">{row.title}</span> — {row.detail}
          </li>
        ))}
      </ul>

      <label className="mt-6 block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">탈퇴 사유</span>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value as (typeof WITHDRAW_REASONS)[number]["id"])}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[14px] font-semibold text-slate-900"
        >
          {WITHDRAW_REASONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <input
          type="checkbox"
          checked={agreeDelete}
          onChange={(e) => setAgreeDelete(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-[#FF853E] focus:ring-[#FF853E]"
        />
        <span className="text-[13px] font-medium leading-relaxed text-slate-800">
          개인정보 및 활동 기록 삭제에 동의합니다. 삭제 후 복구할 수 없음을 이해했습니다.
        </span>
      </label>

      <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <input
          type="checkbox"
          checked={agreeFinal}
          onChange={(e) => setAgreeFinal(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-[#FF853E] focus:ring-[#FF853E]"
        />
        <span className="text-[13px] font-medium leading-relaxed text-slate-800">
          모모아 회원 탈퇴에 동의합니다.
        </span>
      </label>

      <label className="mt-6 block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
          확인을 위해 <span className="text-rose-600">탈퇴</span>를 입력해 주세요
        </span>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="탈퇴"
          autoComplete="off"
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] font-medium outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200/80"
        />
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
        </label>
      ) : (
        <p className="mt-5 rounded-2xl border border-amber-100 bg-amber-50/90 px-4 py-3 text-[12px] font-medium text-amber-950">
          비밀번호형 로컬 계정이 없습니다. 위 동의와 &quot;탈퇴&quot; 입력만으로 진행돼요.
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
          onClick={handleWithdraw}
          className="flex-1 rounded-2xl bg-rose-600 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-rose-200"
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}
