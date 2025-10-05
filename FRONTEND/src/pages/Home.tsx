import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Database, CheckCircle, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-blockchain.jpg";
import { useMutation } from "@tanstack/react-query";

// ✅ Backend API call
const loginWithWallet = async (address: string) => {
  const res = await fetch("/api/auth/wallet-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress: address }),
  });

  if (!res.ok) throw new Error("Failed to login with wallet");
  return res.json();
};

// ✅ Type Declaration for window.ethereum
declare global {
  interface EthereumProvider {
    isMetaMask?: boolean;
    request?: (args: { method: string; params?: any[] }) => Promise<any>;
  }

  interface Window {
    ethereum?: EthereumProvider;
  }
}

const Home = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: loginWithWallet,
    onSuccess: (data: any) => {
      toast({
        title: "✅ Wallet Connected",
        description: `Logged in as ${data.walletAddress.slice(0, 6)}...${data.walletAddress.slice(-4)}`,
      });
    },
    onError: () => {
      toast({
        title: "❌ Login Failed",
        description: "Unable to authenticate wallet",
        variant: "destructive",
      });
    },
  });

  // ✅ Safe MetaMask connection
  const connectWallet = async () => {
    try {
      if (window.ethereum && window.ethereum.request) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const address = accounts[0];
        setWalletAddress(address);
        setWalletConnected(true);

        // ✅ Send to backend
        mutation.mutate(address);
      } else {
        throw new Error("MetaMask not detected. Please install it.");
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Please install MetaMask",
        variant: "destructive",
      });
    }
  };

  const features = [
    { icon: Shield, title: "Blockchain Security", description: "Your identity data is secured by Ethereum's immutable blockchain technology" },
    { icon: Lock, title: "Privacy First", description: "Only encrypted hashes are stored on-chain, never your raw personal data" },
    { icon: Database, title: "IPFS Storage", description: "Documents are stored on decentralized IPFS network for maximum availability" },
    { icon: CheckCircle, title: "Instant Verification", description: "Get verified once, use everywhere with our trusted network partners" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Blockchain KYC Verification" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background-secondary/90" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Blockchain KYC
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Verification System
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Secure & Decentralized Identity Verification using Ethereum + IPFS.
              Experience the future of privacy-first compliance solutions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {walletConnected ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 glass-card px-6 py-3">
                    <Wallet className="h-5 w-5 text-success" />
                    <span className="text-foreground font-medium">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                  </div>
                  <Link to="/auth">
                    <Button className="btn-gradient px-8 py-3 text-lg h-14">
                      Start Verification
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  onClick={connectWallet}
                  className="btn-gradient px-8 py-3 text-lg glow-pulse h-14"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Connecting..." : "Connect Wallet to Begin"}
                </Button>
              )}
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {features.map((feature, idx) => (
                <div key={idx} className="glass-card p-6 text-center">
                  <feature.icon className="h-10 w-10 mx-auto mb-4 text-primary-start" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
