import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-cilent";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";

import PageNotFound from "./lib/PageNotFound";

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

function ProtectedRoute({ children }) {
  const userId = localStorage.getItem('userId');
  if (!userId) return <Navigate to="/Auth" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            <Route path="/Auth" element={<Auth />} />
            <Route path="/" element={<Navigate to="/Home" replace />} />
            <Route path="/Home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/Carparks" element={<ProtectedRoute><Carparks /></ProtectedRoute>} />
            <Route path="/Carpark" element={<ProtectedRoute><Carpark /></ProtectedRoute>} />
            <Route path="/Navigate" element={<ProtectedRoute><NavigatePage /></ProtectedRoute>} />
            <Route path="/Rate" element={<ProtectedRoute><Rate /></ProtectedRoute>} />
            <Route path="/SavePrompt" element={<ProtectedRoute><SavePrompt /></ProtectedRoute>} />
            <Route path="/ThankYou" element={<ProtectedRoute><ThankYou /></ProtectedRoute>} />
            <Route path="/Saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}