import { useEffect, useState } from "react"
import { Search, User as UserIcon, Users, LogOut } from "lucide-react"
import { collection, query, where, onSnapshot, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { signOut, User } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { ChatEntity } from "@/App"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AppSidebarProps {
    user: User;
    onSelectChat: (chat: ChatEntity) => void;
    activeChatId?: string;
}

export function AppSidebar({ user, onSelectChat, activeChatId }: AppSidebarProps) {
    const [chats, setChats] = useState<ChatEntity[]>([])
    const [selectedChatType, setSelectedChatType] = useState<'all' | 'dm' | 'group'>('all')
    const [searchQuery, setSearchQuery] = useState("")

    // 1. REAL-TIME LISTENER
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "chats"),
            where("participants", "array-contains", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedChats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ChatEntity[];

            setChats(fetchedChats);
        }, (error) => {
            console.error("🚨 Firestore Listener Error:", error.message);
        });

        return () => unsubscribe();
    }, [user]);

    // 2. SEARCH / ADD FRIEND LOGIC
    const handleStartChat = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        try {
            const usersRef = collection(db, "users")
            const q = query(usersRef, where("email", "==", searchQuery.toLowerCase().trim()))
            const querySnapshot = await getDocs(q)

            if (querySnapshot.empty) {
                alert("No user found with that email!")
                return
            }

            const targetUser = querySnapshot.docs[0]

            if (targetUser.id === user.uid) {
                alert("You cannot start a DM with yourself!")
                return
            }

            await addDoc(collection(db, "chats"), {
                type: "dm",
                participants: [user.uid, targetUser.id],
                name: targetUser.data().displayName,
                updatedAt: serverTimestamp(),
                lastMessage: "Chat started"
            })

            setSearchQuery("")
        } catch (error) {
            console.error("Error starting chat:", error)
            alert("Failed to start chat. Check console.")
        }
    }

    // 3. LOGOUT LOGIC
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    // 4. DERIVED STATE FOR UI
    const uiChats = chats.filter((chat) =>
        selectedChatType === 'all' || chat.type === selectedChatType
    );

    return (
        <Sidebar>
            {/* HEADER: Search Bar */}
            <SidebarHeader className="p-4 border-b">
                <form onSubmit={handleStartChat} className="flex items-center gap-2">
                    <Input
                        placeholder="Search email to DM..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 text-sm"
                    />
                    <Button type="submit" size="icon" className="h-8 w-8 shrink-0">
                        <Search className="h-4 w-4" />
                        <span className="sr-only">Search</span>
                    </Button>
                </form>
            </SidebarHeader>

            {/* CONTENT: Chat List */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {uiChats.map((chat) => (
                                <SidebarMenuItem key={chat.id}>
                                    <SidebarMenuButton
                                        className={`h-12 ${activeChatId === chat.id ? "bg-gray-200" : ""}`}
                                        onClick={() => onSelectChat(chat)}
                                    >
                                        <Avatar className="h-8 w-8 mr-2">
                                            <AvatarFallback>
                                                {chat.type === "group" ? <Users className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col items-start justify-center">
                      <span className="font-medium">
                        {chat.name || "Direct Message"}
                      </span>
                                        </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* FOOTER: Logout Button */}
            <SidebarFooter className="p-4 border-t">
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </Button>
            </SidebarFooter>
        </Sidebar>
    )
}