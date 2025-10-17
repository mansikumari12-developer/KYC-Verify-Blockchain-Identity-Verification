import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WizardProgress from "@/components/ui/wizard-progress";
import LoadingSpinner from "@/components/ui/loading-spinner";
import Webcam from "react-webcam";
import { ethers } from "ethers";
import KycRegistryABI from "@/abi/KycRegistry.json";
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
  const webcamRef = useRef<Webcam | null>(null);
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

  const captureImage = async (): Promise<string | null> => {
    if (!webcamRef.current) return null;
    const imageSrc = webcamRef.current.getScreenshot();
    return imageSrc || null;
  };

  const uploadToBackend = async (image: string, stepId: string) => {
    // Upload captured image to backend
    const formData = new FormData();
    const blob = await fetch(image).then(res => res.blob());
    formData.append("file", blob, "capture.png");    
    formData.append("step", stepId);
    const res = await fetch("/api/verification/liveness", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.cid; // IPFS CID from backend
  };

  const handleCapture = async () => {
    if (currentStep >= steps.length) return;

    setIsCapturing(true);
    setProcessingStep(steps[currentStep].id);

    try {
      const image = await captureImage();
      if (!image) throw new Error("No camera image captured");

      // Upload captured image → backend → IPFS
      const cid = await uploadToBackend(image, steps[currentStep].id);

      // Mark step complete
      setSteps(prev =>
        prev.map((s, i) => (i === currentStep ? { ...s, completed: true } : s))
      );

      toast({
        title: "✅ Step Completed",
        description: `${steps[currentStep].title} verified (CID: ${cid})`,
      });

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // All steps done → finalize blockchain submission
        await finalizeVerificationOnChain();
        toast({
          title: "🎉 Verification Complete",
          description: "Your liveness verification is on-chain!",
        });
        navigate("/status");
      }
    } catch (err: any) {
      toast({
        title: "❌ Capture Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
      setProcessingStep(null);
    }
  };

  const finalizeVerificationOnChain = async () => {
    try {
      if (!(window as any).ethereum) throw new Error("MetaMask not detected");

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS!,
        KycRegistryABI,
        signer
      );

      // Call the contract’s setStatus (example: 1 = verified)
      const tx = await contract.setStatus(await signer.getAddress(), 1);
      await tx.wait();
      console.log("✅ On-chain verification done:", tx.hash);
    } catch (error: any) {
      console.error("❌ Blockchain Error:", error);
      toast({
        title: "Blockchain Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRetake = () => {
    setSteps(livenessSteps);
    setCurrentStep(0);
    toast({
      title: "Verification Reset",
      description: "You can now retake the liveness verification",
    });
  };

  const allStepsCompleted = steps.every(s => s.completed);
  const currentStepData = steps[currentStep];
  const Icon = currentStepData?.icon;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <WizardProgress currentStep={3} totalSteps={4} steps={wizardSteps} />

        <div className="glass-card p-8 fade-in">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Live Verification</h1>
            <p className="text-muted-foreground">
              Binance-style liveness check — please follow instructions
            </p>
          </div>

          {/* ✅ Live Camera */}
          <div className="flex justify-center mb-8">
            <div className="w-80 h-80 rounded-full overflow-hidden border-4 border-primary-start">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{ facingMode: "user" }}
              />
            </div>
          </div>

          {!allStepsCompleted ? (
            <>
              <div className="text-center mb-8">
                {Icon && <Icon className="h-8 w-8 text-primary-start mx-auto mb-2" />}
                <h3 className="text-xl font-semibold mb-2">{currentStepData.title}</h3>
                <p className="text-muted-foreground">{currentStepData.instruction}</p>
              </div>

              <div className="flex justify-center space-x-2 mb-4">
                {steps.map((s, i) => (
                  <div
                    key={s.id}
                    className={`w-3 h-3 rounded-full ${s.completed ? "bg-success" : i === currentStep ? "bg-primary-start" : "bg-muted"
                      }`}
                  />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleCapture} disabled={isCapturing} variant="gradient">
                  {isCapturing ? <LoadingSpinner size="sm" /> : <Camera className="h-4 w-4 mr-2" />}
                  {isCapturing ? "Processing..." : "Capture"}
                </Button>

                <Button onClick={handleRetake} variant="secondary">
                  <RotateCcw className="h-4 w-4 mr-2" /> Retake
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-success mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-8 border-l-2 border-b-2 border-white rotate-[-45deg]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Liveness Verification Complete!
              </h3>
              <p className="text-muted-foreground mb-6">
                All verification steps completed successfully
              </p>
              <Button onClick={() => navigate("/status")} variant="gradient">
                <ArrowRight className="h-4 w-4 mr-2" /> View Verification Status
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verification;
