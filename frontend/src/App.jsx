import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-cilent";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";

import PageNotFound from "./lib/PageNotFound";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";

// Pages
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Carparks from "./pages/Carparks";
import Carpark from "./pages/Carpark";
import NavigatePage from "./pages/Navigate";
import Rate from "./pages/Rate";
import SavePrompt from "./pages/SavePrompt";
import ThankYou from "./pages/ThankYou";
import Saved from "./pages/Saved";

// ---------------------
// Protected App
// ---------------------
const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  // Loading spinner
  if (isLoadingAuth || isLoadingPublicSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError?.type === "auth_required") {
    return <Navigate to="/auth" replace />;
  }

  if (authError?.type === "user_not_registered") {
    return <UserNotRegisteredError />;
  }

  // Protected routes
  return (
    <Routes>
      {/* Default "/" goes to Home */}
      <Route path="/" element={<Navigate to="/Home" replace />} />

      <Route path="/Home" element={<Home />} />
      <Route path="/Carparks" element={<Carparks />} />
      <Route path="/Carpark" element={<Carparks />} />
      <Route path="/Navigate" element={<NavigatePage />} />
      <Route path="/Rate" element={<Rate />} />
      <Route path="/SavePrompt" element={<SavePrompt />} />
      <Route path="/ThankYou" element={<ThankYou />} />
      <Route path="/Saved" element={<Saved />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

// ---------------------
// Main App
// ---------------------
export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            <Route path="/Auth" element={<Auth />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/Carparks" element={<Carparks />} />
            <Route path="/Carpark" element={<Carpark />} />
            <Route path="/Navigate" element={<NavigatePage />} />
            <Route path="/Rate" element={<Rate />} />
            <Route path="/SavePrompt" element={<SavePrompt />} />
            <Route path="/ThankYou" element={<ThankYou />} />
            <Route path="/Saved" element={<Saved />} />
            <Route path="/" element={<Navigate to="/Home" replace />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}