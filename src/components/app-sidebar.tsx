import React, { useEffect, useState } from "react";
import { Search, User as UserIcon, Users, LogOut } from "lucide-react";
// @ts-ignore will use later
import { collection, query, where, onSnapshot, getDocs, addDoc, serverTimestamp, doc, getDoc, setDoc, limit } from "firebase/firestore";
import { signOut, User } from "firebase/auth";
import { auth, db } from "../lib/firebase.ts";
import { ChatEntity } from "../App.tsx";

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
} from "./ui/sidebar.tsx";
import { Avatar, AvatarFallback } from "./ui/avatar.tsx";
import { Button } from "./ui/button.tsx";
// @ts-ignore will use later
import { Input } from "./ui/input.tsx";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "./ui/command.tsx";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./ui/popover.tsx";

interface AppSidebarProps {
    user: User;
    onSelectChat: (chat: ChatEntity) => void;
    activeChatId?: string;
}

export function AppSidebar({ user, onSelectChat, activeChatId }: AppSidebarProps) {
    console.log("current user: ", user);
    const [chats, setChats] = useState<ChatEntity[]>([])
    // @ts-ignore may very well use setSelectedChatType() later
    const [selectedChatType, setSelectedChatType] = useState<'all' | 'dm' | 'group'>('all')
    const [searchQuery, setSearchQuery] = useState("")
    const [open, setOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<{id: string, email: string, name: string}[]>([]);

    // Fetch suggestions as the user types
    useEffect(() => {
        // Only search if they've typed at least 2 characters to save database reads
        if (searchQuery.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                const searchPrefix = searchQuery.toLowerCase().trim();
                const usersRef = collection(db, "users");

                // The Firebase "Starts With" query magic
                const q = query(
                    usersRef,
                    where("email", ">=", searchPrefix),
                    where("email", "<=", searchPrefix + "\uf8ff"),
                    limit(5) // Only show the top 5 results
                );

                const snapshot = await getDocs(q);
                const results = snapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        email: doc.data().email,
                        name: doc.data().displayName
                    }))
                    // Filter out the current user so they don't see themselves in the dropdown
                    .filter(u => u.id !== user.uid);

                setSuggestions(results);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            }
        };

        fetchSuggestions();
    }, [searchQuery, user.uid]);

    // Handle clicking a suggestion from the dropdown
    const onSelectSuggestion = async (targetUser: {id: string, name: string}) => {
        setOpen(false);
        setSearchQuery("");

        if (targetUser.id === user.uid) {
            alert("You cannot DM yourself!!!");
            return;
        }

        try {
            //const dmId = [user.uid, targetUser.id].sort().join("_");
            //const chatRef = doc(db, "chats", dmId);

            //const chatSnap = await getDoc(chatRef);

            //if ()

            await addDoc(collection(db, "chats"), {
                type: "dm",
                participants: [user.uid, targetUser.id],
                name: targetUser.name,
                updatedAt: serverTimestamp(),
                lastMessage: "Chat started"
            });
        } catch (error) {
            console.error("Error starting chat:", error);
            alert("Failed to start chat.");
        }
    };

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
    // @ts-ignore will use later
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
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-start text-muted-foreground font-normal h-9"
                        >
                            <Search className="mr-2 h-4 w-4 shrink-0" />
                            {/* Show the typed query, or the placeholder if empty */}
                            {searchQuery || "Search users..."}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                        <Command>
                            {/* CommandInput handles the actual typing */}
                            <CommandInput
                                placeholder="Type an email..."
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                            />
                            <CommandList>
                                <CommandEmpty>
                                    {searchQuery.length < 2
                                        ? "Type at least 2 characters..."
                                        : "No users found."}
                                </CommandEmpty>
                                <CommandGroup>
                                    {suggestions.map((suggestion) => (
                                        <CommandItem
                                            key={suggestion.id}
                                            value={suggestion.email}
                                            onSelect={() => onSelectSuggestion(suggestion)}
                                            className="cursor-pointer"
                                        >
                                            <UserIcon className="mr-2 h-4 w-4" />
                                            <div className="flex flex-col">
                                                <span>{suggestion.name}</span>
                                                <span className="text-xs text-muted-foreground">{suggestion.email}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
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
                <div>
                    Logged in as: {user.displayName}
                </div>
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </Button>
            </SidebarFooter>
        </Sidebar>
    )
}