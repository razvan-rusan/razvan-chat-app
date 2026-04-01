import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar.tsx";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Filter, Users} from "lucide-react";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import React, {useEffect, useState} from "react";
import {ChatEntity} from "@/App";
import {collection, onSnapshot, query, where} from "@firebase/firestore";
import {db} from "@/lib/firebase.ts";
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { LogOut } from "lucide-react"
import { SidebarFooter } from "@/components/ui/sidebar"
import { Search, User as UserIcon } from "lucide-react" // Added Search
import { getDocs, addDoc, serverTimestamp } from "firebase/firestore" // Added getDocs, addDoc, serverTimestamp
import { User } from "firebase/auth"
import { Input } from "@/components/ui/input"

type ChatType = 'dm' | 'group' | 'all';

interface AppSidebarProps {
    user: User;
    onSelectChat: (chat: ChatEntity) => void;
    activeChatId?: string;
}

export function AppSidebar({user, onSelectChat, activeChatId}: AppSidebarProps) {
    const [chats, setChats] = useState<ChatEntity[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedChatType, setSelectedChatType] = useState("");

    useEffect(() => { // Real-time firestore listener!
        if (!user) {
            console.log("No user logged in yet.");
            return;
        }

        console.log("Setting up listener for user:", user.uid);

        const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log("🔥 Snapshot fired! Documents found:", snapshot.docs.length);

            const fetchedChats = snapshot.docs.map(doc => ({
                id: doc.id, ...doc.data()
            })) as ChatEntity[];

            console.log("Processed chats ready for UI:", fetchedChats);
            setChats(fetchedChats);
        }, (error) => {
            console.error("🚨 Firestore Listener Error:", error.message);
        });

        return () => unsubscribe(); // Cleanup listener when component unmounts
    }, [user]);

    const uiChats = chats.filter((chat) => selectedChatType === 'all' || chat.type === selectedChatType);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const handleStartChat = async (e: React.SyntheticEvent) => {
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

            setSearchQuery("");

        } catch (error) {
            console.error("Error starting chat:", error)
            alert("Failed to start chat. Check console.")
        }
    }

    return (<Sidebar>
        {/*HEADER: Says "Chats" and lets you filter them by type*/}
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

        {/*CONTENT: The scrollable list of chats*/}
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {uiChats.map((chat) => (<SidebarMenuItem key={chat.id}>
                                <SidebarMenuButton
                                    className={`h-12 ${activeChatId === chat.id ? "bg-gray-200" : ""}`}
                                    onClick={() => onSelectChat(chat)}>
                                    <Avatar className="h-8 w-8 mr-2">
                                        <AvatarFallback>
                                            {chat.type === "group" ? <Users className="h-4 w-4"/> : chat.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start justify-center">
                                          <span className="font-medium">
                                              {chat.name || "Direct Message"}
                                          </span>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
            </Button>
        </SidebarFooter>
    </Sidebar>);
}