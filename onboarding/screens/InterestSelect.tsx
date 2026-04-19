import SelectChip from "../components/common/SelectChip";
import { INTEREST_CATEGORY_OPTIONS, INTEREST_SELECTION_MAX } from "../interestCategories";

interface InterestSelectProps {
  selected: string[];
  onToggle: (value: string) => void;
  error?: string;
}

export default function InterestSelect({
  selected,
  onToggle,
  error,
}: InterestSelectProps) {
  const atMax = selected.length >= INTEREST_SELECTION_MAX;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {INTEREST_CATEGORY_OPTIONS.map((item) => {
          const isSelected = selected.includes(item);
          const disableSelect = !isSelected && atMax;
          return (
            <SelectChip
              key={item}
              selected={isSelected}
              onClick={() => onToggle(item)}
              className={
                disableSelect ? "cursor-not-allowed opacity-45" : undefined
              }
              title={disableSelect ? `관심 영역은 최대 ${INTEREST_SELECTION_MAX}개까지예요` : undefined}
            >
              {item}
            </SelectChip>
          );
        })}
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}
