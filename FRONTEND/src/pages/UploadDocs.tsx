import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WizardProgress from "@/components/ui/wizard-progress";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Upload, FileText, CheckCircle, ArrowRight, Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api"; // 🔹 axios client

const UploadDocs = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const wizardSteps = ["Identity", "Documents", "Verification", "Complete"];

  const acceptedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadErrors([]);

    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (!acceptedTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid type. Upload PDF, JPEG, or PNG.`);
        return;
      }
      if (file.size > maxFileSize) {
        errors.push(`${file.name}: File exceeds 5MB limit.`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) {
      setUploadErrors(errors);
      toast({
        title: "Upload Errors",
        description: `${errors.length} file(s) invalid`,
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      uploadToBackend(validFiles);
    }
  };

  // 🔹 Real Upload
  const uploadToBackend = async (files: File[]) => {
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((file) => fd.append("files", file));

      const res = await api.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadedFiles((prev) => [...prev, ...files]);

      toast({
        title: "✅ Upload Successful",
        description: `Uploaded ${files.length} file(s)`,
      });
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err?.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Documents Uploaded",
        description: "Please upload at least one document to continue",
        variant: "destructive",
      });
      return;
    }
    navigate("/verification");
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    toast({
      title: "File Removed",
      description: "Document removed from list",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <WizardProgress currentStep={2} totalSteps={4} steps={wizardSteps} />
        </div>

        <div className="glass-card p-8 fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-primary">
                <Upload className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Upload KYC Documents</h1>
            <p className="text-muted-foreground">
              Upload identity documents for verification (PDF, JPEG, PNG - Max 5MB each)
            </p>
          </div>

          {/* Upload Area */}
          <div className="mb-8">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border-light rounded-xl p-8 text-center cursor-pointer hover:border-primary-start hover:shadow-[0_0_20px_hsl(var(--glow-primary)/0.3)] transition-all duration-300"
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Click to Upload Documents
              </h3>
              <p className="text-muted-foreground mb-4">or drag & drop files here</p>
              <div className="text-sm text-muted-foreground">
                Supported: PDF, JPEG, PNG • Max size: 5MB per file
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpeg,.jpg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mb-6 p-4 bg-muted/20 border border-border-light rounded-lg">
              <div className="flex items-center space-x-3">
                <LoadingSpinner size="sm" />
                <span className="text-foreground">Uploading files...</span>
              </div>
            </div>
          )}

          {/* Errors */}
          {uploadErrors.length > 0 && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
              <h4 className="text-error font-medium mb-2">Upload Errors:</h4>
              <ul className="text-sm text-error space-y-1">
                {uploadErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-foreground mb-4">
                Uploaded Documents ({uploadedFiles.length})
              </h3>
              <div className="space-y-3">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted/20 border border-border-light rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-primary-start" />
                      <div>
                        <div className="font-medium text-foreground">{file.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {file.type.split("/")[1].toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-error hover:text-error hover:bg-error/10"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Continue */}
          <Button
            onClick={handleContinue}
            variant="gradient"
            className="w-full py-3 flex items-center justify-center space-x-2"
            disabled={uploadedFiles.length === 0}
          >
            <span>Next Step: Live Verification</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadDocs;
