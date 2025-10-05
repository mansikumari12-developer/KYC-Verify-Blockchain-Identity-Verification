import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  className?: string;
}

const WizardProgress = ({ currentStep, totalSteps, steps, className }: WizardProgressProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn("w-full", className)}>
      {/* Progress Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
      </div>

      {/* Progress Bar */}
      <div className="progress-kyc mb-6">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            {/* Step Circle */}
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 mb-2",
                index + 1 < currentStep
                  ? "bg-success text-white shadow-[0_0_15px_hsl(var(--glow-success)/0.4)]"
                  : index + 1 === currentStep
                  ? "bg-gradient-primary text-white shadow-[0_0_20px_hsl(var(--glow-primary)/0.5)] animate-glow-pulse"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index + 1 < currentStep ? (
                <Check className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </div>
            
            {/* Step Label */}
            <span className={cn(
              "text-xs text-center transition-colors duration-300",
              index + 1 <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"
            )}>
              {step}
            </span>
            
            {/* Connection Line */}
            {index < steps.length - 1 && (
              <div className="absolute w-full h-0.5 bg-muted mt-5 -z-10" style={{
                left: `${(100 / steps.length) * (index + 0.5)}%`,
                width: `${100 / steps.length}%`
              }}>
                <div 
                  className="h-full bg-gradient-primary transition-all duration-500"
                  style={{ 
                    width: index + 1 < currentStep ? '100%' : '0%' 
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WizardProgress;