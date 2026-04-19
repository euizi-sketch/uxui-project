import { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function InputField({
  label,
  error,
  className = "",
  ...props
}: InputFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        {...props}
        className={`h-11 w-full rounded-xl border px-3 text-sm outline-none transition focus:border-[#FF853E] ${
          error ? "border-rose-400" : "border-slate-300"
        } ${className}`}
      />
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </label>
  );
}
