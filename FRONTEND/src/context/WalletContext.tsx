import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// ✅ Declare MetaMask globals
declare global {
  interface Ethereum {
    isMetaMask?: boolean;
    request?: (args: { method: string; params?: any[] }) => Promise<any>;
    on?: (event: string, callback: (...args: any[]) => void) => void;
    removeListener?: (event: string, callback: (...args: any[]) => void) => void;
  }
  interface Window {
    ethereum?: Ethereum;
  }
}

interface WalletContextType {
  walletAddress: string;
  walletConnected: boolean;
  connecting: boolean;
  connectWallet: () => Promise<string | null>;
  walletLogin: () => Promise<any>;
  logout: () => void;
}

const WalletContext = createContext<WalletContextType>({
  walletAddress: "",
  walletConnected: false,
  connecting: false,
  connectWallet: async () => null,
  walletLogin: async () => null,
  logout: () => {},
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  // ✅ Connect MetaMask wallet
  const connectWallet = async (): Promise<string | null> => {
    setConnecting(true);
    try {
      if (!window.ethereum?.request) {
        throw new Error("MetaMask not detected. Please install it.");
      }

      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const address = accounts[0];
      if (!address) throw new Error("No wallet address found.");

      setWalletAddress(address);
      setWalletConnected(true);

      toast({
        title: "Wallet Connected",
        description: `${address.slice(0, 6)}...${address.slice(-4)}`,
      });

      return address;
    } catch (err: any) {
      toast({
        title: "Connection Failed",
        description: err?.message || "Unable to connect wallet",
        variant: "destructive",
      });
      return null;
    } finally {
      setConnecting(false);
    }
  };

  // ✅ Wallet login (connect + call backend)
  const walletLogin = async () => {
    try {
      let address: string | null = walletAddress;
      if (!address) {
        address = await connectWallet();
        if (!address) throw new Error("Wallet connection failed");
      }

      const res = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Wallet login failed");

      if (data?.data?.token)
        localStorage.setItem("token", data.data.token);
      if (data?.data?.user)
        localStorage.setItem("user", JSON.stringify(data.data.user));

      setWalletAddress(address);
      setWalletConnected(true);

      toast({
        title: "Wallet Login Successful",
        description: `${address.slice(0, 6)}...${address.slice(-4)}`,
      });

      return data;
    } catch (err: any) {
      toast({
        title: "Wallet Login Failed",
        description: err?.message || "Unable to login with wallet",
        variant: "destructive",
      });
      throw err;
    }
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setWalletAddress("");
    setWalletConnected(false);
    toast({ title: "Logged Out" });
  };

  // ✅ Watch wallet account changes safely
  useEffect(() => {
    if (!window.ethereum?.on) return;

    const handleAccounts = (accounts: string[]) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
      } else {
        setWalletAddress("");
        setWalletConnected(false);
      }
    };

    window.ethereum.on("accountsChanged", handleAccounts);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccounts);
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        walletConnected,
        connecting,
        connectWallet,
        walletLogin,
        logout,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
