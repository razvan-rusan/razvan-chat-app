import { SidebarProvider } from "./ui/sidebar.tsx";
import {AppSidebar} from "@/components/app-sidebar.tsx";
import {ChatArea} from "@/components/chat-area.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Plus} from "lucide-react";
import {CreateGroupModal} from "@/components/create-group-modal.tsx";
import { useState } from "react";
import {ChatEntity} from "@/App.tsx";
import {User} from "@firebase/auth";

export default function ChatLayout({user}: { user: User }) {
    const [activeChat, setActiveChat] = useState<ChatEntity | null>(null);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false); // Add state for the modal

    return (
        <SidebarProvider>
            <AppSidebar user={user} onSelectChat={setActiveChat} activeChatId={activeChat?.id}/>
            <main className="flex-1 h-screen overflow-hidden flex flex-col relative">
                {activeChat ? (
                    <ChatArea currentUser={user} chat={activeChat} />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Select a chat to start messaging
                    </div>
                )}

                <Button
                    size="icon"
                    className="absolute bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setIsGroupModalOpen(true)}
                >
                    <Plus className="h-6 w-6"/>
                    <span className="sr-only">Create Group</span>
                </Button>

                <CreateGroupModal
                    isOpen={isGroupModalOpen}
                    onClose={() => setIsGroupModalOpen(false)}
                />
            </main>
        </SidebarProvider>
    );
}