import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { WalletProvider } from "@/context/WalletContext";

// 🧠 Automatically route API requests to the correct backend
if (import.meta.env.MODE === "production") {
  const originalFetch = window.fetch;
  const baseUrl = "https://kyc-verify-blockchain-identity.onrender.com"; // 🔥 Replace with your Render backend URL

  window.fetch = (input, init) => {
    if (typeof input === "string" && input.startsWith("/api")) {
      input = baseUrl + input;
    }
    return originalFetch(input, init);
  };
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>
);
