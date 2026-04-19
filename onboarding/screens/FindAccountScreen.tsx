import { useEffect, useMemo, useState } from "react";
import InputField from "../components/common/InputField";
import {
  canResetPassword,
  normalizePhoneDigits,
  tryFindUserId,
} from "../../profile/accountCredentialsStorage";
import {
  clearSmsVerification,
  peekSmsVerification,
  startSmsVerification,
  verifySmsCode,
} from "../../profile/smsVerificationSession";

type TabKey = "id" | "pw";

interface FindAccountScreenProps {
  tab: TabKey;
  title: string;
  onTabChange: (tab: TabKey) => void;
  onBack: () => void;
  onFoundId: (foundId: string) => void;
  onGoResetPassword: () => void;
}

export default function FindAccountScreen({
  tab,
  title,
  onTabChange,
  onBack,
  onFoundId,
  onGoResetPassword,
}: FindAccountScreenProps) {
  const [form, setForm] = useState({
    registeredId: "",
    name: "",
    phone1: "010",
    phone2: "",
    phone3: "",
    code: "",
  });
  const [result, setResult] = useState<{ foundId?: string }>({});
  const [banner, setBanner] = useState("");
  const [error, setError] = useState("");
  /** 로컬 데모: 실제 SMS 대신 화면에 표시 */
  const [demoCode, setDemoCode] = useState("");

  const phoneDigits = useMemo(
    () => normalizePhoneDigits(form.phone1, form.phone2, form.phone3),
    [form.phone1, form.phone2, form.phone3]
  );

  /** 휴대전화 10~11자리 입력 시 활성화 (이름·아이디는 발송 버튼 클릭 시 검증) */
  const canRequestCode = useMemo(() => {
    return phoneDigits.length >= 10 && phoneDigits.length <= 11;
  }, [phoneDigits]);

  useEffect(() => {
    setResult({});
    setError("");
    setBanner("");
    setDemoCode("");
    clearSmsVerification();
    setForm((f) => ({ ...f, code: "" }));
  }, [tab]);

  const handleSendCode = () => {
    setError("");
    setBanner("");
    setDemoCode("");
    if (!canRequestCode) return;

    if (!form.name.trim()) {
      setError("이름(가입 시 닉네임)을 입력해 주세요.");
      return;
    }

    if (tab === "pw" && !form.registeredId.trim()) {
      setError("가입된 아이디를 입력해 주세요.");
      return;
    }

    if (tab === "id") {
      if (!tryFindUserId(form.name, phoneDigits)) {
        setError("가입 시 입력한 이름·휴대전화와 일치하는 회원을 찾을 수 없습니다.");
        return;
      }
    } else if (!canResetPassword(form.registeredId, form.name, phoneDigits)) {
      setError("가입 시 입력한 아이디·이름·휴대전화와 일치하는 회원을 찾을 수 없습니다.");
      return;
    }

    const { code, expiresAt } = startSmsVerification();
    const until = new Date(expiresAt).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setBanner(`인증번호를 발송했습니다. ${until}까지 입력해 주세요.`);
    setDemoCode(code);
  };

  const handleSubmit = () => {
    setError("");
    if (!form.code.trim()) {
      setError("인증번호를 입력해 주세요.");
      return;
    }
    if (!peekSmsVerification()) {
      setError("유효한 인증번호가 없습니다. 만료되었으면 인증번호를 다시 요청해 주세요.");
      return;
    }
    if (!verifySmsCode(form.code)) {
      setError("인증번호가 올바르지 않습니다.");
      return;
    }

    if (tab === "id") {
      const id = tryFindUserId(form.name, phoneDigits);
      if (!id) {
        setError("회원 정보를 다시 확인해 주세요.");
        return;
      }
      setResult({ foundId: id });
      onFoundId(id);
    } else {
      onGoResetPassword();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="h-10 w-10 rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid grid-cols-2">
          <button
            type="button"
            onClick={() => onTabChange("id")}
            className={`py-3 text-sm font-bold transition ${
              tab === "id"
                ? "bg-[#FF853E] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            아이디
          </button>
          <button
            type="button"
            onClick={() => onTabChange("pw")}
            className={`py-3 text-sm font-bold transition ${
              tab === "pw"
                ? "bg-[#FF853E] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            비밀번호
          </button>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">등록된 휴대폰 번호로 찾기</p>
        <p className="text-xs leading-5 text-slate-600">
          가입 시 입력한 휴대전화로 인증 후{" "}
          {tab === "id" ? "아이디를 확인" : "비밀번호를 재설정"}할 수 있습니다. 이름은{" "}
          <span className="font-medium text-slate-800">가입 시 닉네임</span>과 동일하게 입력해
          주세요.
        </p>

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        ) : null}

        {banner ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {banner}
          </p>
        ) : null}

        {demoCode ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900">
            데모: 받은 인증번호는 <span className="select-all font-mono text-base">{demoCode}</span>{" "}
            입니다. (실서비스에서는 문자로 전송됩니다.)
          </p>
        ) : null}

        {tab === "pw" && (
          <InputField
            label="가입된 아이디 입력"
            placeholder="가입된 아이디 입력"
            value={form.registeredId}
            onChange={(e) =>
              setForm((f) => ({ ...f, registeredId: e.target.value }))
            }
          />
        )}

        <InputField
          label="이름 (가입 시 닉네임)"
          placeholder="가입 시 입력한 닉네임"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">휴대전화</p>
          <div className="flex min-w-0 gap-2">
            <select
              value={form.phone1}
              onChange={(e) => setForm((f) => ({ ...f, phone1: e.target.value }))}
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
              value={form.phone2}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone2: e.target.value.replace(/\D/g, "").slice(0, 4) }))
              }
              className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-[#FF853E]"
              inputMode="numeric"
              placeholder="0000"
            />
            <input
              value={form.phone3}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone3: e.target.value.replace(/\D/g, "").slice(0, 4) }))
              }
              className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-[#FF853E]"
              inputMode="numeric"
              placeholder="0000"
            />
            <button
              type="button"
              disabled={!canRequestCode}
              onClick={handleSendCode}
              className="h-11 w-24 flex-none rounded-xl bg-[#FF853E] px-3 text-sm font-bold text-white transition hover:bg-[#FF6F1F] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              인증번호
            </button>
          </div>
        </div>

        <InputField
          label="인증번호"
          placeholder="인증번호 6자리 숫자 입력"
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
          inputMode="numeric"
        />
        <p className="text-xs text-slate-500">인증번호 6자리를 입력한 뒤 아래 버튼을 눌러 주세요.</p>

        <button
          type="button"
          className="mt-2 h-12 w-full rounded-xl bg-[#FF853E] px-4 text-sm font-bold text-white transition hover:bg-[#FF6F1F]"
          onClick={handleSubmit}
        >
          {tab === "id" ? "아이디 찾기" : "비밀번호 재설정"}
        </button>

        {tab === "id" && result.foundId && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">아이디 찾기 결과</p>
            <p className="mt-1">
              회원님의 아이디는{" "}
              <span className="font-bold text-[#FF853E]">{result.foundId}</span>
              입니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
