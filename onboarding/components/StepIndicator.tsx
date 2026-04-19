interface StepIndicatorProps {
  labels: string[];
  currentIndex: number;
}

export default function StepIndicator({
  labels,
  currentIndex,
}: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center gap-2">
        {labels.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 flex-1 rounded-full ${
              idx <= currentIndex ? "bg-[#FF853E]" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Step {currentIndex + 1} / {labels.length} · {labels[currentIndex]}
      </p>
    </div>
  );
}
