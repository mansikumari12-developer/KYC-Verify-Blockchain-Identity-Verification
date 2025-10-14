import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type IdentityResponse = { message: string; data?: { mainCID: string } };

const SubmitIdentity = () => {
  const [formData, setFormData] = useState({ fullName: "", idNumber: "", dob: "", address: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "Not Logged In", description: "Please sign in", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/identity/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      const data: IdentityResponse = await res.json();
      console.log("Identity submit response:", data);

      if (!res.ok || !data.data?.mainCID) {
        throw new Error(data.message || "CID missing, submission failed");
      }

      toast({ title: "✅ Identity Submitted", description: data.message });

      // ✅ Navigate with CID to UploadDocs
      navigate(`/upload-docs?cid=${data.data.mainCID}`);

    } catch (err: any) {
      toast({ title: "Submission Failed", description: err.message || "Could not submit identity", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800">
        <Input placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
        <Input placeholder="ID Number" value={formData.idNumber} onChange={e => setFormData({ ...formData, idNumber: e.target.value })} required />
        <Input type="date" placeholder="Date of Birth" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} required />
        <Input placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
        <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? "Submitting..." : "Submit for Verification"}
        </Button>
      </form>
    </div>
  );
};

export default SubmitIdentity;
