import "./App.css";
import { SidebarProvider } from "@/components/ui/sidebar.tsx";
import { AppSidebar } from "@/components/app-sidebar.tsx";
import { ChatArea } from "@/components/chat-area.tsx";
import { EmailLoginPage } from "@/components/login-page.tsx";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { onAuthStateChanged, User } from "@firebase/auth";
import {useEffect, useState} from "react";
import {auth} from "@/lib/firebase.ts";

function ProtectedRoute(
  { user, children }: { user: User | null; children: React.ReactNode },
) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function ChatLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 h-screen overflow-hidden flex flex-col">
        <ChatArea />
      </main>
    </SidebarProvider>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const unsubsrcibe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false);
      })

      return () => unsubsrcibe();
  }, [])

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/chat" replace /> : <EmailLoginPage />}
        />
        <Route path="/chat" element={
            <ProtectedRoute user={user}>
                <ChatLayout />
            </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
