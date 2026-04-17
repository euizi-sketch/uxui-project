interface ConsentScreenProps {
  consentAccepted: boolean;
  onChange: (value: boolean) => void;
}

export default function ConsentScreen({
  consentAccepted,
  onChange,
}: ConsentScreenProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
        서비스 이용약관과 개인정보 처리방침에 동의해야 가입을 진행할 수
        있습니다.
      </div>
      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3">
        <input
          type="checkbox"
          checked={consentAccepted}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4"
        />
        <span className="text-sm text-slate-700">
          [필수] 약관 및 개인정보 수집/이용 동의
        </span>
      </label>
    </div>
  );
}
