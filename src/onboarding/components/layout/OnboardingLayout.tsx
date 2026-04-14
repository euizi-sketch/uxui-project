import { ReactNode } from "react";
import StepIndicator from "../StepIndicator";
import PrimaryButton from "../common/PrimaryButton";

interface OnboardingLayoutProps {
  title: string;
  description?: string;
  showStep?: boolean;
  stepLabels?: string[];
  currentStepIndex?: number;
  children: ReactNode;
  ctaLabel?: string;
  onCtaClick?: () => void;
  ctaDisabled?: boolean;
}

export default function OnboardingLayout({
  title,
  description,
  showStep = true,
  stepLabels = [],
  currentStepIndex = 0,
  children,
  ctaLabel,
  onCtaClick,
  ctaDisabled = false,
}: OnboardingLayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white px-5 pb-28 pt-8">
      {showStep && stepLabels.length > 0 && (
        <div className="mb-8">
          <StepIndicator labels={stepLabels} currentIndex={currentStepIndex} />
        </div>
      )}
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-600">{description}</p>}
      </header>
      <main className="flex-1 space-y-4">{children}</main>
      {ctaLabel && onCtaClick && (
        <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-5 pb-5 pt-4">
          <div className="mx-auto max-w-md">
            <PrimaryButton disabled={ctaDisabled} onClick={onCtaClick}>
              {ctaLabel}
            </PrimaryButton>
          </div>
        </footer>
      )}
    </div>
  );
}
