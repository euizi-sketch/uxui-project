import { ReactNode } from "react";
import StepIndicator from "../StepIndicator";
import PrimaryButton from "../common/PrimaryButton";

interface OnboardingLayoutProps {
  title: string;
  description?: string;
  showStep?: boolean;
  hideHeader?: boolean;
  containerClassName?: string;
  mainClassName?: string;
  stepLabels?: string[];
  currentStepIndex?: number;
  children: ReactNode;
  ctaLabel?: string;
  onCtaClick?: () => void;
  ctaDisabled?: boolean;
  backLabel?: string;
  onBackClick?: () => void;
  backDisabled?: boolean;
}

export default function OnboardingLayout({
  title,
  description,
  showStep = true,
  hideHeader = false,
  containerClassName = "",
  mainClassName = "",
  stepLabels = [],
  currentStepIndex = 0,
  children,
  ctaLabel,
  onCtaClick,
  ctaDisabled = false,
  backLabel,
  onBackClick,
  backDisabled = false,
}: OnboardingLayoutProps) {
  return (
    <div
      className={`flex min-h-[100dvh] w-full flex-col bg-sky-100 px-5 pb-safe-tab pt-[calc(2rem+env(safe-area-inset-top,0px))] ${containerClassName}`}
    >
      {showStep && stepLabels.length > 0 && (
        <div className="mb-6 shrink-0">
          <StepIndicator labels={stepLabels} currentIndex={currentStepIndex} />
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          <div className="mx-auto my-auto flex w-full max-w-sm flex-col">
            {!hideHeader && (
              <header className="mb-6 space-y-2">
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                {description && <p className="text-sm text-slate-600">{description}</p>}
              </header>
            )}
            <div className={`space-y-4 ${mainClassName}`}>{children}</div>
          </div>
        </div>
      </div>
      {ctaLabel && onCtaClick && (
        <footer className="app-bottom-fixed z-40 border-t border-slate-200/80 bg-sky-100 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pt-4">
          <div className="w-full">
            <div className="flex gap-3">
              {backLabel && onBackClick && (
                <button
                  type="button"
                  disabled={backDisabled}
                  onClick={onBackClick}
                  className="h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {backLabel}
                </button>
              )}
              <div className={backLabel && onBackClick ? "flex-1" : "w-full"}>
                <PrimaryButton disabled={ctaDisabled} onClick={onCtaClick}>
                  {ctaLabel}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
