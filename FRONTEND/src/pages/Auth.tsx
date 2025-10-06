import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/loading-spinner";

type AuthResponse = {
  token: string;
  user: { email: string };
};

const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  console.log(res)
  if (!res.ok) throw new Error("Login failed");
  return res.json() as Promise<AuthResponse>;
};

const Auth = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { toast } = useToast();

  const mutation = useMutation<AuthResponse, Error, { email: string; password: string }>({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => {
      const fetchData = data.data
      localStorage.setItem("token", fetchData.token);
      toast({
        title: "✅ Login Successful",
        description: `Welcome back, ${fetchData.user.email}`,
      });
      navigate("/submit-identity");
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Label>Password</Label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? <LoadingSpinner size="sm" /> : "Login"}
        </Button>
      </form>
    </div>
  );
};

export default Auth;
