import InputField from "../components/common/InputField";
import SelectChip from "../components/common/SelectChip";
import { ChildProfileSlice, ProfileInput } from "../types";

const emptyChild = (): ChildProfileSlice => ({
  gender: "",
  birthDate: "",
  developmentStage: "",
  extraInfo: "",
});

interface ProfileExtraFormProps {
  profile: ProfileInput;
  childErrors: Array<Partial<Record<keyof ChildProfileSlice, string>>>;
  onUpdateChild: (index: number, patch: Partial<ChildProfileSlice>) => void;
  onAddChild: () => void;
  onRemoveChild: (index: number) => void;
}

const genders: { key: ChildProfileSlice["gender"]; label: string }[] = [
  { key: "female", label: "여아" },
  { key: "male", label: "남아" },
];

const stages: { key: ChildProfileSlice["developmentStage"]; label: string }[] = [
  { key: "infant", label: "영아기" },
  { key: "toddler", label: "유아기" },
  { key: "preschooler", label: "아동기" },
];

export default function ProfileExtraForm({
  profile,
  childErrors,
  onUpdateChild,
  onAddChild,
  onRemoveChild,
}: ProfileExtraFormProps) {
  const children = profile.children?.length ? profile.children : [emptyChild()];

  return (
    <div className="space-y-8">
      {children.map((child, index) => {
        const err = childErrors[index] ?? {};

        return (
          <div key={index} className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">아이 {index + 1}</p>
              {children.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveChild(index)}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  삭제
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-700">성별</p>
                {index === 0 ? (
                  <button
                    type="button"
                    onClick={onAddChild}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FFF1EA] text-lg font-bold text-[#FF853E] ring-1 ring-[#FFD2BF] hover:bg-[#ffe8dc]"
                    aria-label="아이 추가"
                  >
                    +
                  </button>
                ) : (
                  <span className="h-9 w-9" aria-hidden="true" />
                )}
              </div>
              <div className="flex gap-2">
                {genders.map((item) => (
                  <SelectChip
                    key={item.key}
                    selected={child.gender === item.key}
                    onClick={() => onUpdateChild(index, { gender: item.key })}
                  >
                    {item.label}
                  </SelectChip>
                ))}
              </div>
              {err.gender && <p className="text-xs text-rose-500">{err.gender}</p>}
            </div>

            <InputField
              label="생년월일 (YYYY-MM-DD)"
              placeholder="2023-05-10"
              value={child.birthDate}
              onChange={(e) => onUpdateChild(index, { birthDate: e.target.value })}
              error={err.birthDate}
            />

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">발달 단계</p>
              <div className="flex flex-wrap gap-2">
                {stages.map((item) => (
                  <SelectChip
                    key={item.key}
                    selected={child.developmentStage === item.key}
                    onClick={() => onUpdateChild(index, { developmentStage: item.key })}
                  >
                    {item.label}
                  </SelectChip>
                ))}
              </div>
              {err.developmentStage && (
                <p className="text-xs text-rose-500">{err.developmentStage}</p>
              )}
            </div>

            <InputField
              label="추가 정보 (알레르기/식습관)"
              placeholder="예: 우유 알레르기, 편식 있음"
              value={child.extraInfo}
              onChange={(e) => onUpdateChild(index, { extraInfo: e.target.value })}
            />
          </div>
        );
      })}
    </div>
  );
}
