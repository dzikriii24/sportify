// App.tsx
import { Toaster } from 'react-hot-toast';
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
import ChatCommunity from "./pages/Chat";
import NotFound from "./pages/NotFound";
import ResetPasswordPage from "../src/loginAuth/ResetPasswordPage";

import CreateCommunity from "./pages/create/CreateCommunity";
import CreateEvent from "./pages/create/CreateEvent";
import CreateVenue from "./pages/create/CreateVanue";
import VenueDetail from "./pages/VenueDetail";
import CommunityChat from './pages/CommunityChat';
import EventDetail from './pages/event/EventDetail';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard-community" element={<DashboardCommunity />} />
            <Route path="/" element={<Index />} />
            <Route path="/courts" element={<Courts />} />
            <Route path="/chat" element={<ChatCommunity />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            <Route path="/create-community" element={<CreateCommunity />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/create-venue" element={<CreateVenue />} />
            <Route path="/venue/:id" element={<VenueDetail />} />
            <Route path="/community/:slug" element={<CommunityChat />} />
            <Route path="/event/:id" element={<EventDetail />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
