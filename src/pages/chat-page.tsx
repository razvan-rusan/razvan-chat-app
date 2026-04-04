import { SidebarProvider } from "../components/ui/sidebar.tsx";
import { AppSidebar } from "@/components/app-sidebar.tsx";
import { ChatArea } from "@/components/chat-area.tsx";
import { CreateGroupModal } from "@/components/create-group-modal.tsx";
import { useState } from "react";
import { ChatEntity } from "@/App.tsx";
import { User } from "@firebase/auth";

export default function ChatPage({ user }: { user: User }) {
  const [activeChat, setActiveChat] = useState<ChatEntity | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false); // Add state for the modal

  return (
    <SidebarProvider>
      <AppSidebar
        user={user}
        onSelectChat={setActiveChat}
        activeChatId={activeChat?.id}
        onCreateGroup={() => setIsGroupModalOpen(true)}
      />
      <main className="flex-1 h-screen overflow-hidden flex flex-col relative">
        {activeChat
          ? <ChatArea currentUser={user} chat={activeChat} />
          : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a chat to start messaging
            </div>
          )}

        <CreateGroupModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          currentUser={user}
        />
      </main>
    </SidebarProvider>
  );
}
