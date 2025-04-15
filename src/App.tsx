
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Index from "./pages/Index";
import GameDetail from "./pages/GameDetail";
import NotFound from "./pages/NotFound";
import LoadingScreen from "./components/LoadingScreen";
import VocalRemoverPage from "./pages/VocalRemoverPage";
import StreamingPage from "./pages/StreamingPage";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);

  const handleLoadingComplete = () => {
    setLoading(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {loading ? (
          <AnimatePresence mode="wait">
            <motion.div
              key="loading"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <LoadingScreen onComplete={handleLoadingComplete} />
            </motion.div>
          </AnimatePresence>
        ) : (
          <HashRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/game/:gameId" element={<GameDetail />} />
              <Route path="/vocalremover" element={<VocalRemoverPage />} />
              <Route path="/streaming" element={<StreamingPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
