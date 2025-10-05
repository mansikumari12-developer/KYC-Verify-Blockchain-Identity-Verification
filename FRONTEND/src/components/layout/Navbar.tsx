import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Menu, X, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/auth", label: "Sign In" },
    { href: "/submit-identity", label: "Submit Identity" },
    { href: "/upload-docs", label: "Upload Docs" },
    { href: "/verification", label: "Verification" },
    { href: "/status", label: "Status" },
    { href: "/access-control", label: "Access" },
    { href: "/history", label: "History" },
    { href: "/admin", label: "Admin" },
  ];

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Simulate MetaMask connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAddress = "0x742d35Cc6634C0532925a3b8D93B9D8b8C4b8CdE";
      setWalletAddress(mockAddress);
      setWalletConnected(true);
      
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${mockAddress.slice(0, 6)}...${mockAddress.slice(-4)}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">KYC Verify</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? "text-primary-start nav-link-active"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            {walletConnected ? (
              <div className="flex items-center space-x-2 rounded-lg bg-card px-3 py-2">
                <Wallet className="h-4 w-4 text-success" />
                <span className="text-sm text-foreground">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            ) : (
              <Button onClick={connectWallet} variant="gradient" className="px-6 py-2" disabled={isConnecting}>
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-md px-3 py-2 text-base font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? "bg-gradient-primary text-white shadow-lg"
                      : "text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4">
                {walletConnected ? (
                  <div className="flex items-center space-x-2 rounded-lg bg-card px-3 py-2">
                    <Wallet className="h-4 w-4 text-success" />
                    <span className="text-sm text-foreground">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                  </div>
                ) : (
                  <Button onClick={connectWallet} variant="gradient" className="w-full" disabled={isConnecting}>
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;