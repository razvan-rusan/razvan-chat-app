import { useEffect, useState } from "react";
import { Search, User as UserIcon, Users, LogOut } from "lucide-react";
import { collection, query, where, onSnapshot, getDocs, addDoc, serverTimestamp, limit } from "firebase/firestore";
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
    const [chats, setChats] = useState<ChatEntity[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<{id: string, email: string, name: string}[]>([]);

    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                const searchPrefix = searchQuery.toLowerCase().trim();
                const usersRef = collection(db, "users");

                const q = query(
                    usersRef,
                    where("email", ">=", searchPrefix),
                    where("email", "<=", searchPrefix + "\uf8ff"),
                    limit(5)
                );

                const snapshot = await getDocs(q);
                const results = snapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        email: doc.data().email,
                        name: doc.data().displayName
                    }))
                    .filter(u => u.id !== user.uid);

                setSuggestions(results);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            }
        };

        fetchSuggestions();
    }, [searchQuery, user.uid]);

    const onSelectSuggestion = async (targetUser: {id: string, name: string}) => {
        setOpen(false);
        setSearchQuery("");

        if (targetUser.id === user.uid) {
            alert("You cannot DM yourself!!!");
            return;
        }

        try {
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

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <Sidebar>
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
                            {searchQuery || "Search users..."}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                        <Command>
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

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {chats.map((chat) => (
                                <SidebarMenuItem key={chat.id}>
                                    <SidebarMenuButton
                                        className={`h-12 rounded-none border-l-2 ${
                                            activeChatId === chat.id
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                        }`}
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

            <SidebarFooter className="p-4 border-t">
                <div className="mb-2 text-sm text-muted-foreground px-2">
                    Logged in as: <span className="text-foreground">{user.displayName}</span>
                </div>
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </Button>
            </SidebarFooter>
        </Sidebar>
    )
}