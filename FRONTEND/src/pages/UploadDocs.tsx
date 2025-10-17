import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WizardProgress from "@/components/ui/wizard-progress";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Upload, FileText, CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

interface UploadAPIResponse {
  success: boolean;
  message: string;
  data?: { cid: string; fileName?: string }[];
}

interface UploadedFile {
  file: File;
  cid?: string;
}

const UploadDocs = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const wizardSteps = ["Identity", "Documents", "Verification", "Complete"];
  const acceptedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
  const maxFileSize = 5 * 1024 * 1024;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadErrors([]);

    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (!acceptedTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid type (PDF, JPEG, PNG only).`);
      } else if (file.size > maxFileSize) {
        errors.push(`${file.name}: Exceeds 5MB limit.`);
      } else validFiles.push(file);
    });

    if (errors.length) {
      setUploadErrors(errors);
      toast({
        title: "Upload Errors",
        description: `${errors.length} invalid file(s).`,
        variant: "destructive",
      });
    }

    if (validFiles.length) uploadToBackend(validFiles);
  };

  const uploadToBackend = async (files: File[]) => {
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((file) => fd.append("documents", file)); // 👈 must match backend

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not logged in");

      const res = await api.post<UploadAPIResponse>("/upload", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        timeout: 0,
      });

      if (!res.data.success) throw new Error(res.data.message);

      const uploaded = res.data.data?.map((item, i) => ({
        file: files[i],
        cid: item.cid,
      })) || [];

      setUploadedFiles((prev) => [...prev, ...uploaded]);
      toast({
        title: "✅ Upload Successful",
        description: `${files.length} file(s) uploaded.`,
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
    if (!uploadedFiles.length) {
      toast({
        title: "No Documents Uploaded",
        description: "Upload at least one document before continuing.",
        variant: "destructive",
      });
      return;
    }
    navigate("/verification");
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
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
        <WizardProgress currentStep={2} totalSteps={4} steps={wizardSteps} />

        <div className="glass-card p-8 fade-in">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-primary">
                <Upload className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Upload KYC Documents</h1>
            <p className="text-muted-foreground">
              Upload ID documents (PDF, JPEG, PNG, up to 5MB each)
            </p>
          </div>

          <div className="mb-8">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary-start transition-all"
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Click or Drop Files</h3>
              <p className="text-sm text-muted-foreground">
                Supported: PDF, JPEG, PNG • Max: 5MB
              </p>
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

          {uploading && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center space-x-3">
                <LoadingSpinner size="sm" />
                <span>Uploading files...</span>
              </div>
            </div>
          )}

          {uploadErrors.length > 0 && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
              <h4 className="text-error font-medium mb-2">Errors:</h4>
              <ul className="text-sm space-y-1">
                {uploadErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">
                Uploaded ({uploadedFiles.length})
              </h3>
              <div className="space-y-3">
                {uploadedFiles.map((fileObj, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted/20 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-primary-start" />
                      <div>
                        <div className="font-medium">{fileObj.file.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(fileObj.file.size)} •{" "}
                          {fileObj.file.type.split("/")[1].toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-error hover:bg-error/10"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleContinue}
            variant="gradient"
            className="w-full py-3 flex items-center justify-center space-x-2"
            disabled={!uploadedFiles.length}
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
