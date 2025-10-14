import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { WalletProvider } from "@/context/WalletContext"; // ✅ Use alias or correct path

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>
);
