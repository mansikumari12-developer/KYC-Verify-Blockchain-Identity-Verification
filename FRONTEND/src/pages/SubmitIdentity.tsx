import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// ✅ Response type
type IdentityResponse = { message: string };

const SubmitIdentity = () => {
  const [formData, setFormData] = useState({ fullName: "", idNumber: "" });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/identity/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to submit identity");
      const data = (await res.json()) as IdentityResponse;
      toast({
        title: "✅ Identity Submitted",
        description: data.message, // ✅ TS knows "message"
      });
      navigate("/upload-docs");
    } catch {
      toast({
        title: "Submission Failed",
        description: "Could not submit identity",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Full Name"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
        <Input
          placeholder="ID Number"
          value={formData.idNumber}
          onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
        />
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
};

export default SubmitIdentity;
