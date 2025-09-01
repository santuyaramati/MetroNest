import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { BookmarkProvider } from "@/contexts/BookmarkContext";
import Index from "./pages/Index";
import Rooms from "./pages/Rooms";
import Flatmates from "./pages/Flatmates";
import RoomDetails from "./pages/RoomDetails";
import FlatmateDetails from "./pages/FlatmateDetails";
import PGs from "./pages/PGs";
import Login from "./pages/Login";
import PostListing from "./pages/PostListing";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <BookmarkProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
              <Header />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/rooms/:id" element={<RoomDetails />} />
                <Route path="/flatmates" element={<Flatmates />} />
                <Route path="/flatmates/:id" element={<FlatmateDetails />} />
                <Route path="/pgs" element={<PGs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/post-listing" element={<PostListing />} />
                <Route path="/profile" element={<Profile />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </BookmarkProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
