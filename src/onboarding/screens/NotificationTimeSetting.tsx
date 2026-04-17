import InputField from "../components/common/InputField";

interface NotificationTimeSettingProps {
  time: string;
  onChange: (value: string) => void;
}

export default function NotificationTimeSetting({
  time,
  onChange,
}: NotificationTimeSettingProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        원하는 알림 시간을 설정하면 매일 해당 시간에 맞춤 콘텐츠를 보내드려요.
      </p>
      <InputField
        label="알림 시간"
        type="time"
        value={time}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
