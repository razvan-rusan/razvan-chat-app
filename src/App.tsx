import "./globals.css";
import { LoginPage } from "@/pages/login-page.tsx";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { onAuthStateChanged, User } from "@firebase/auth";
import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebase.ts";
import ChatPage from "@/pages/chat-page.tsx";
import { SettingsPage } from "@/pages/settings-page.tsx";
export type ChatEntity = {
  id: string;
  name?: string;
  type: "dm" | "group";
  participants: string[];
};

function ProtectedRoute(
  { user, children }: { user: User | null; children: React.ReactNode },
) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/chat" replace /> : <LoginPage />}
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute user={user}>
              <ChatPage user={user!} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute user={user}>
              <SettingsPage user={user!} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
