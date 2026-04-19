import SelectChip from "../components/common/SelectChip";
import { UserType } from "../types";

interface UserTypeSelectProps {
  value: UserType;
  onSelect: (value: Exclude<UserType, null>) => void;
}

const userTypes: { key: Exclude<UserType, null>; label: string }[] = [
  { key: "mom", label: "엄마" },
  { key: "dad", label: "아빠" },
  { key: "grandparent", label: "조부모" },
  { key: "guardian", label: "보호자" },
  { key: "other", label: "기타" },
];

export default function UserTypeSelect({ value, onSelect }: UserTypeSelectProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {userTypes.map((type) => (
        <SelectChip
          key={type.key}
          selected={value === type.key}
          onClick={() => onSelect(type.key)}
        >
          {type.label}
        </SelectChip>
      ))}
    </div>
  );
}
