import "./App.css";
import {SidebarProvider} from "@/components/ui/sidebar.tsx";
import {AppSidebar} from "@/components/app-sidebar.tsx";
import {ChatArea} from "@/components/chat-area.tsx";
import {EmailLoginPage} from "@/components/login-page.tsx";
import {
    BrowserRouter as Router,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";
import {onAuthStateChanged, User} from "@firebase/auth";
import {useEffect, useState} from "react";
import {auth} from "@/lib/firebase.ts";

export type ChatEntity = {
    id: string;
    name?: string;
    type: "dm" | "group";
    participants: string[];
}

function ProtectedRoute(
    {user, children}: { user: User | null; children: React.ReactNode },
) {
    if (!user) {
        return <Navigate to="/login" replace/>;
    }
    return <>{children}</>;
}

function ChatLayout({user}: { user: User }) {
    const [activeChat, setActiveChat] = useState<ChatEntity | null>(null);

    return (
        <SidebarProvider>
            <AppSidebar user={user} onSelectChat={setActiveChat} activeChatId={activeChat?.id}/>
            <main className="flex-1 h-screen overflow-hidden flex flex-col">
                {activeChat ? (
                    <ChatArea currentUser={user} chat={activeChat} />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a chat to start messaging
                    </div>
                )}
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
                    element={user ? <Navigate to="/chat" replace/> : <EmailLoginPage/>}
                />
                <Route path="/chat" element={
                    <ProtectedRoute user={user}>
                        <ChatLayout user={user}/>
                    </ProtectedRoute>
                }/>
                <Route path="*" element={<Navigate to="/login" replace/>}/>
            </Routes>
        </Router>
    );
}
