import SelectChip from "../components/common/SelectChip";

interface InterestSelectProps {
  selected: string[];
  onToggle: (value: string) => void;
  error?: string;
}

const categories = ["언어", "놀이", "운동", "수면", "식습관", "정서"];

export default function InterestSelect({
  selected,
  onToggle,
  error,
}: InterestSelectProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <SelectChip
            key={item}
            selected={selected.includes(item)}
            onClick={() => onToggle(item)}
          >
            {item}
          </SelectChip>
        ))}
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}
