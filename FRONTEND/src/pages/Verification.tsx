import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WizardProgress from "@/components/ui/wizard-progress";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Camera, RotateCcw, ArrowRight, Eye, Smile, ArrowLeft, ArrowUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type LivenessStep = {
  id: string;
  title: string;
  instruction: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
};

const Verification = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const wizardSteps = ["Identity", "Documents", "Verification", "Complete"];

  const livenessSteps: LivenessStep[] = [
    { id: "center", title: "Look at Camera", instruction: "Position your face in the center of the circle", icon: Camera, completed: false },
    { id: "left", title: "Turn Head Left", instruction: "Slowly turn your head to the left", icon: ArrowLeft, completed: false },
    { id: "right", title: "Turn Head Right", instruction: "Slowly turn your head to the right", icon: ArrowUp, completed: false },
    { id: "blink", title: "Blink Your Eyes", instruction: "Blink your eyes naturally a few times", icon: Eye, completed: false },
    { id: "smile", title: "Smile", instruction: "Give us a natural smile", icon: Smile, completed: false },
  ];

  const [steps, setSteps] = useState(livenessSteps);

  const handleCapture = async () => {
    if (currentStep < steps.length) {
      setIsCapturing(true);
      setProcessingStep(steps[currentStep].id);

      try {
        // ✅ Call backend API for this liveness step
        const res = await fetch("/api/verification/liveness", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ step: steps[currentStep].id }),
        });

        if (!res.ok) throw new Error("Step verification failed");

        setSteps(prev =>
          prev.map((step, index) =>
            index === currentStep ? { ...step, completed: true } : step
          )
        );

        toast({
          title: "✅ Step Completed",
          description: `${steps[currentStep].title} verified successfully`,
        });

        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          // ✅ Final verification complete
          await fetch("/api/verification/complete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          toast({
            title: "🎉 Verification Complete",
            description: "Your liveness verification has been submitted",
          });

          navigate("/status");
        }
      } catch (error: any) {
        toast({
          title: "❌ Capture Failed",
          description: error.message || "Could not verify this step",
          variant: "destructive",
        });
      } finally {
        setIsCapturing(false);
        setProcessingStep(null);
      }
    }
  };

  const handleRetake = () => {
    setSteps(prev =>
      prev.map((step, index) =>
        index === currentStep ? { ...step, completed: false } : step
      )
    );
    setCurrentStep(0);
    toast({
      title: "Verification Reset",
      description: "You can now retake the liveness verification",
    });
  };

  const allStepsCompleted = steps.every(step => step.completed);
  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <WizardProgress currentStep={3} totalSteps={4} steps={wizardSteps} />
        </div>

        <div className="glass-card p-8 fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-primary">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Live Verification
            </h1>
            <p className="text-muted-foreground">
              Complete our Binance-style liveness check to verify your identity
            </p>
          </div>

          {/* Camera Frame */}
          <div className="mb-8">
            <div className="relative mx-auto w-80 h-80 rounded-full border-4 border-primary-start bg-card/50 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-background-secondary to-card flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-muted/30 mb-4 mx-auto flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center">
                      <Camera className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Camera Preview</p>
                </div>
              </div>

              {isCapturing && (
                <div className="absolute inset-0 bg-primary-start/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin-slow w-16 h-16 border-4 border-white/30 border-t-white rounded-full mb-4" />
                    <p className="text-white font-medium">Processing...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!allStepsCompleted ? (
            <>
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <currentStepData.icon className="h-8 w-8 text-primary-start" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {currentStepData.title}
                </h3>
                <p className="text-muted-foreground">
                  {currentStepData.instruction}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex justify-center space-x-2 mb-4">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${step.completed
                          ? "bg-success"
                          : index === currentStep
                            ? "bg-primary-start"
                            : "bg-muted"
                        }`}
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleCapture}
                  disabled={isCapturing}
                  variant="gradient"
                  className="px-8 py-3 flex items-center space-x-2"
                >
                  {isCapturing ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      <span>Capture</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleRetake}
                  variant="secondary"
                  className="px-8 py-3 flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Retake</span>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-success mx-auto mb-4 flex items-center justify-center">
                  <div className="w-8 h-8 border-l-2 border-b-2 border-white transform rotate-[-45deg] success-check" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Liveness Verification Complete!
                </h3>
                <p className="text-muted-foreground">
                  All verification steps completed successfully
                </p>
              </div>

              <Button
                onClick={() => navigate("/status")}
                variant="gradient"
                className="w-full py-3 flex items-center justify-center space-x-2"
              >
                <span>View Verification Status</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verification;
