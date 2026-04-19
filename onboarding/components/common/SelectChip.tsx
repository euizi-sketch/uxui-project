import { ReactNode } from "react";

interface SelectChipProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  title?: string;
}

export default function SelectChip({
  selected,
  onClick,
  children,
  className = "",
  disabled = false,
  title,
}: SelectChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${
        selected
          ? "border-[#FF853E] bg-[#FFF1EA] text-[#FF853E]"
          : "border-slate-300 text-slate-600 hover:border-slate-400 disabled:hover:border-slate-300"
      } ${className}`}
    >
      {children}
    </button>
  );
}
