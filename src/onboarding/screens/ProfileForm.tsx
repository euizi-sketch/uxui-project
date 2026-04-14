import InputField from "../components/common/InputField";
import SelectChip from "../components/common/SelectChip";
import { ProfileInput } from "../types";

interface ProfileFormProps {
  profile: ProfileInput;
  errors: Partial<Record<keyof ProfileInput, string>>;
  onChange: <K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) => void;
}

const genders: { key: ProfileInput["gender"]; label: string }[] = [
  { key: "female", label: "여아" },
  { key: "male", label: "남아" },
  { key: "other", label: "기타" },
];

const stages: { key: ProfileInput["developmentStage"]; label: string }[] = [
  { key: "infant", label: "영아기" },
  { key: "toddler", label: "유아기" },
  { key: "preschooler", label: "취학전" },
];

export default function ProfileForm({ profile, errors, onChange }: ProfileFormProps) {
  return (
    <div className="space-y-4">
      <InputField
        label="아이 정보"
        placeholder="예: 22개월 첫째"
        value={profile.childInfo}
        onChange={(e) => onChange("childInfo", e.target.value)}
        error={errors.childInfo}
      />
      <InputField
        label="이름"
        value={profile.name}
        onChange={(e) => onChange("name", e.target.value)}
        error={errors.name}
      />
      <InputField
        label="닉네임"
        value={profile.nickname}
        onChange={(e) => onChange("nickname", e.target.value)}
        error={errors.nickname}
      />
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">성별</p>
        <div className="flex gap-2">
          {genders.map((item) => (
            <SelectChip
              key={item.key}
              selected={profile.gender === item.key}
              onClick={() => onChange("gender", item.key)}
            >
              {item.label}
            </SelectChip>
          ))}
        </div>
        {errors.gender && <p className="text-xs text-rose-500">{errors.gender}</p>}
      </div>
      <InputField
        label="생년월일 (YYYY-MM-DD)"
        placeholder="2023-05-10"
        value={profile.birthDate}
        onChange={(e) => onChange("birthDate", e.target.value)}
        error={errors.birthDate}
      />
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">발달 단계</p>
        <div className="flex flex-wrap gap-2">
          {stages.map((item) => (
            <SelectChip
              key={item.key}
              selected={profile.developmentStage === item.key}
              onClick={() => onChange("developmentStage", item.key)}
            >
              {item.label}
            </SelectChip>
          ))}
        </div>
        {errors.developmentStage && (
          <p className="text-xs text-rose-500">{errors.developmentStage}</p>
        )}
      </div>
      <InputField
        label="추가 정보 (알레르기/식습관)"
        placeholder="예: 우유 알레르기, 편식 있음"
        value={profile.extraInfo}
        onChange={(e) => onChange("extraInfo", e.target.value)}
      />
    </div>
  );
}
