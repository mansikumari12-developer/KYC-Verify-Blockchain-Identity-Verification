import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import SubmitIdentity from "./pages/SubmitIdentity";
import UploadDocs from "./pages/UploadDocs";
import Verification from "./pages/Verification";
import Status from "./pages/Status";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/submit-identity" element={<SubmitIdentity />} />
              <Route path="/upload-docs" element={<UploadDocs />} />
              <Route path="/verification" element={<Verification />} />
              <Route path="/status" element={<Status />} />
              {/* Placeholder routes for remaining pages */}
              <Route path="/history" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-foreground mb-4">Verification History</h1><p className="text-muted-foreground">Coming soon...</p></div></div>} />
              <Route path="/access-control" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-foreground mb-4">Access Control</h1><p className="text-muted-foreground">Coming soon...</p></div></div>} />
              <Route path="/admin" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-foreground mb-4">Admin Dashboard</h1><p className="text-muted-foreground">Coming soon...</p></div></div>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
