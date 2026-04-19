interface NotificationPermissionProps {
  value: boolean | null;
  onSelect: (value: boolean) => void;
}

export default function NotificationPermission({
  value,
  onSelect,
}: NotificationPermissionProps) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => onSelect(true)}
        className={`w-full rounded-xl border p-4 text-left ${
          value === true ? "border-[#FF853E] bg-[#FFF1EA]" : "border-slate-200"
        }`}
      >
        <p className="font-medium text-slate-800">알림 허용</p>
        <p className="text-sm text-slate-600">아이 맞춤 콘텐츠 알림을 받습니다.</p>
      </button>
      <button
        type="button"
        onClick={() => onSelect(false)}
        className={`w-full rounded-xl border p-4 text-left ${
          value === false ? "border-[#FF853E] bg-[#FFF1EA]" : "border-slate-200"
        }`}
      >
        <p className="font-medium text-slate-800">지금은 거절</p>
        <p className="text-sm text-slate-600">
          나중에 설정에서 언제든 변경할 수 있습니다.
        </p>
      </button>
    </div>
  );
}
