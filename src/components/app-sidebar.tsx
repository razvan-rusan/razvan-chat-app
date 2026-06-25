import { useEffect, useState } from "react";
import { LogOut, Plus, Settings, User as UserIcon, Users } from "lucide-react";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  updateDoc,
} from "firebase/firestore";
import { signOut, User } from "firebase/auth";
import { auth, db } from "../lib/firebase.ts";
import { ChatEntity } from "../App.tsx";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar.tsx";
import { Avatar, AvatarFallback } from "./ui/avatar.tsx";
import { Button } from "./ui/button.tsx";
import { SearchedUser, UserSearch } from "@/components/user-search.tsx";
import { useNavigate } from "react-router-dom";

interface AppSidebarProps {
  user: User;
  onSelectChat: (chat: ChatEntity) => void;
  activeChatId?: string;
  onCreateGroup: () => void;
}

export function AppSidebar(
  { user, onSelectChat, activeChatId, onCreateGroup }: AppSidebarProps,
) {
  const [chats, setChats] = useState<ChatEntity[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const rawChats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatEntity[];

      const resolvedChats = await Promise.all(
        rawChats.map(async (chat) => {
          if (chat.type === "dm") {
            // 1. FAST PATH: The array exists
            if (chat.participantNames && chat.participantNames.length === 2) {
              // Find the index of the current user in the participants array
              const myIndex = chat.participants.indexOf(user.uid);
              // The "other" person is at the other index
              const otherIndex = myIndex === 0 ? 1 : 0;
              return { ...chat, name: chat.participantNames[otherIndex] };
            } 
            // 2. SLOW PATH: Needs fetch + migration
            else {
              try {
                const otherUserId = chat.participants.find((id) => id !== user.uid);
                const userSnap = await getDoc(doc(db, "users", otherUserId!));
                
                if (userSnap.exists()) {
                  const otherName = userSnap.data().displayName;
                  const myName = user.displayName || "Me";
                  
                  // Maintain order: Index 0 name matches Index 0 UID, Index 1 matches Index 1
                  const myIndex = chat.participants.indexOf(user.uid);
                  const namesArray = myIndex === 0 
                    ? [myName, otherName] 
                    : [otherName, myName];

                  await updateDoc(doc(db, "chats", chat.id), {
                    participantNames: namesArray
                  });

                  return { ...chat, name: otherName };
                }
              } catch (error) {
                console.error("Migration failed:", error);
              }
            }
          }
          return chat;
        })
      );
      setChats(resolvedChats);
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

  const handleStartDM = async (targetUser: SearchedUser) => {
    try {
      // 1. Create the participants array and the corresponding names array.
      // We must decide on a consistent order. Sorting by UID is the industry standard
      // because UIDs are globally unique.
      const participants = [user.uid, targetUser.id];
      const names = [
        user.displayName || user.email?.split('@')[0] || "Me",
        targetUser.displayName
      ];

      // 2. Create an array of objects so we can sort them together
      const combined = participants.map((uid, index) => ({
        uid,
        name: names[index]
      }));

      // 3. Sort by UID string. This ensures the order is ALWAYS the same!
      combined.sort((a, b) => a.uid.localeCompare(b.uid));

      // 4. Extract the sorted arrays
      const sortedParticipants = combined.map(item => item.uid);
      const sortedNames = combined.map(item => item.name);

      // 5. Write to DB
      const newChatRef = await addDoc(collection(db, "chats"), {
        type: "dm",
        participants: sortedParticipants,
        participantNames: sortedNames, // Now perfectly aligned!
        updatedAt: serverTimestamp(),
        lastMessage: "Chat started",
      });

      onSelectChat({
        id: newChatRef.id,
        type: "dm",
        participants: sortedParticipants,
        name: targetUser.displayName,
      });
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Failed to start chat.");
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <UserSearch
          placeholder="Search for a friend / group..."
          onSelectUser={handleStartDM}
        />
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
                        {chat.type === "group"
                          ? <Users className="h-4 w-4" />
                          : <UserIcon className="h-4 w-4" />}
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

            <div className="flex justify-center mt-6 mb-4">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-dashed text-muted-foreground hover:text-foreground"
                onClick={onCreateGroup}
              >
                <Plus className="h-5 w-5" />
                <span className="sr-only">Create Group</span>
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

        <SidebarFooter className="p-4 border-t">
            <div className="mb-2 text-sm text-muted-foreground px-2">
                Logged in as: <span className="text-foreground">{user.displayName}</span>
            </div>

            {/* Smecherie Flex Row */}
            <div className="flex items-center w-full gap-2">
                <Button
                    variant="ghost"
                    className="flex-1 justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => navigate("/settings")}
                >
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                </Button>
            </div>
        </SidebarFooter>
    </Sidebar>
  );
}
