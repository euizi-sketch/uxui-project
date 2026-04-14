import { ReactNode } from "react";

interface SelectChipProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}

export default function SelectChip({
  selected,
  onClick,
  children,
}: SelectChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        selected
          ? "border-violet-600 bg-violet-50 text-violet-700"
          : "border-slate-300 text-slate-600 hover:border-slate-400"
      }`}
    >
      {children}
    </button>
  );
}
