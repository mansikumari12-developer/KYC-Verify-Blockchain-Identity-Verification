import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

// ✅ Response type
type StatusResponse = {
  status: "pending" | "approved" | "rejected";
};

const Status = () => {
  const [status, setStatus] = useState<StatusResponse["status"]>("pending");
  const { toast } = useToast();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/verification/status", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = (await res.json()) as StatusResponse;
        setStatus(data.status); // ✅ TS knows "status"
      } catch {
        toast({
          title: "Error",
          description: "Could not load status",
          variant: "destructive",
        });
      }
    };
    fetchStatus();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold">Verification Status</h1>
      <p className="mt-4">Your status: <strong>{status}</strong></p>
    </div>
  );
};

export default Status;
