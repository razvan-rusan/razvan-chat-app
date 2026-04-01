import "./App.css";
import {
    SidebarProvider
} from "@/components/ui/sidebar.tsx";
import {AppSidebar} from "@/components/app-sidebar.tsx";
import {ChatArea} from "@/components/chat-area.tsx";
import {LoginPage} from "@/components/login-page.tsx";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

function ChatLayout() {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <main className="flex-1 h-screen overflow-hidden flex flex-col">
                <ChatArea />
            </main>
        </SidebarProvider>
    );
}


export default function App() {

  return (
      <Router>
          <Routes>
              <Route path="/login" element={<LoginPage/>}/>
              <Route path="/chat" element={<ChatLayout/>}/>
              <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
      </Router>
  );
}
