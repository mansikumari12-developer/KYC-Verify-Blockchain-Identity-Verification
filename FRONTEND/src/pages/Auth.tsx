import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/loading-spinner";

// ===================== 🔹 API CALLS =====================

// 🟢 REGISTER API
const register = async (name: string, email: string, password: string) => {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error("Signup failed");
  return res.json();
};

// 🟡 LOGIN API
const login = async (email: string, password: string) => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
};

// 🟣 WALLET LOGIN API
const walletLogin = async (walletAddress: string) => {
  const res = await fetch("/api/auth/wallet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress }),
  });
  if (!res.ok) throw new Error("Wallet login failed");
  return res.json();
};

// ===================== 🔹 COMPONENT =====================

const Auth = () => {
  const [tab, setTab] = useState<"login" | "register" | "wallet">("login");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const { toast } = useToast();
  const navigate = useNavigate();

  // 🟢 LOGIN MUTATION
  const loginMutation = useMutation({
    mutationFn: () => login(formData.email, formData.password),
    onSuccess: (data: any) => {
      localStorage.setItem("token", data.data.token);
      toast({
        title: "✅ Login successful",
        description: `Welcome, ${data.data.user?.email}`,
      });
      navigate("/submit-identity");
    },
    onError: () => toast({ title: "Login failed", variant: "destructive" }),
  });

  // 🟣 REGISTER MUTATION
  const registerMutation = useMutation({
    mutationFn: () => register(formData.name, formData.email, formData.password),
    onSuccess: (data: any) => {
      localStorage.setItem("token", data.data.token);
      toast({
        title: "🎉 Account created",
        description: `Welcome, ${data.data.user?.email}`,
      });
      navigate("/submit-identity");
    },
    onError: () => toast({ title: "Signup failed", variant: "destructive" }),
  });

  // 🟢 WALLET LOGIN MUTATION
  const walletMutation = useMutation({
    mutationFn: walletLogin,
    onSuccess: (data: any) => {
      localStorage.setItem("token", data.data.token);
      toast({
        title: "🔗 Wallet Connected",
        description: `Welcome, ${data.data.user?.walletAddress}`,
      });
      navigate("/submit-identity");
    },
    onError: () => toast({ title: "Wallet login failed", variant: "destructive" }),
  });

  // 🪙 MetaMask connection handler
  const handleWalletConnect = async () => {
    if (!window.ethereum || !window.ethereum.request) {
      toast({
        title: "MetaMask not found",
        description: "Please install or unlock MetaMask.",
        variant: "destructive",
      });
      return;
    }

    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts || accounts.length === 0) {
        toast({
          title: "No wallet found",
          description: "Please connect a MetaMask account.",
        });
        return;
      }

      const walletAddress = accounts[0];
      walletMutation.mutate(walletAddress);
    } catch (err) {
      console.error(err);
      toast({ title: "Wallet connection cancelled" });
    }
  };

  // 🧾 Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "login") loginMutation.mutate();
    else registerMutation.mutate();
  };

  // ===================== 🔹 UI =====================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-xl">
        {/* Tabs */}
        <div className="flex justify-around mb-6">
          <Button
            variant={tab === "login" ? "default" : "outline"}
            onClick={() => setTab("login")}
          >
            Login
          </Button>
          <Button
            variant={tab === "register" ? "default" : "outline"}
            onClick={() => setTab("register")}
          >
            Register
          </Button>
          <Button
            variant={tab === "wallet" ? "default" : "outline"}
            onClick={() => setTab("wallet")}
          >
            Wallet
          </Button>
        </div>

        {/* Login / Register Form */}
        {tab !== "wallet" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <>
                <Label>Name</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </>
            )}
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <Label>Password</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {loginMutation.isPending || registerMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : tab === "login" ? (
                "Login"
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        )}

        {/* Wallet Login */}
        {tab === "wallet" && (
          <div className="text-center space-y-4">
            <p>Login quickly using your MetaMask wallet</p>
            <Button
              onClick={handleWalletConnect}
              className="w-full"
              disabled={walletMutation.isPending}
            >
              {walletMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                "Connect Wallet"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
