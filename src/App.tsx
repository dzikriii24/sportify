// App.tsx
import { Toaster } from "./manual-components/ui/toaster";
import { Toaster as Sonner } from "./manual-components/ui/sonner";
import { TooltipProvider } from "./manual-components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";



import Dashboard from "../src/Dashboard";
import Login from "../src/loginAuth/LoginPage";
import Register from "../src/loginAuth/RegisterPage";
import DashboardCommunity from "../src/pages/DashboardCommunity";
import Index from "./pages/Index";
import Courts from "./pages/Courts";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard-community" element={<DashboardCommunity />} />
            <Route path="/" element={<Index />} />
            <Route path="/courts" element={<Courts />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
