import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu, SidebarMenuButton, SidebarMenuItem
} from "@/components/ui/sidebar.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Filter, Users} from "lucide-react";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import {useState} from "react";

type ChatType = 'dm'|'group'|'all';

interface ChatEntity {
    id: number;
    name: string;
    type: ChatType;
}

const chats: ChatEntity[] = [
    {id: 1, name: "Mom", type: "dm"},
    {id: 2, name: "Dad", type: "dm"},
    {id: 3, name: "Friend1", type: "dm"},
    {id: 4, name: "Friend2", type: "dm"},
    {id: 5, name: "Family Group Chat", type: "group"},
    {id: 6, name: "Friends1 Group Chat", type: "group"},
    {id: 7, name: "Work Group Chat", type: "group"}
];

export function AppSidebar() {

    const [selectedChatType, setSelectedChatType] = useState<ChatType>('all');

    const uiChats = chats.filter((chat) => selectedChatType === 'all' || chat.type === selectedChatType);

    return (
      <Sidebar>
          {/*HEADER: Says "Chats" and lets you filter them by type*/}
          <SidebarHeader className="p-4 flex flex-row items-center justify-between border-b">
              <h2 className="text-xl font-bold tracking-tight">Chats</h2>

              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Filter className="h-4 w-4"/>
                          <span className="sr-only">Filter chats</span>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={ () => {setSelectedChatType('all');} }>All Chats</DropdownMenuItem>
                      <DropdownMenuItem onClick={ () => {setSelectedChatType('dm');} }>Direct Messages</DropdownMenuItem>
                      <DropdownMenuItem onClick={ () => {setSelectedChatType('group');} }>Group Chats</DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
          </SidebarHeader>

          {/*CONTENT: The scrollable list of chats*/}
          <SidebarContent>
              <SidebarGroup>
                  <SidebarGroupContent>
                      <SidebarMenu>
                          {uiChats.map((chat) => {
                              console.log(chat);
                              return chat;
                          }).map((chat) => (
                              <SidebarMenuItem key={chat.id}>
                                  <SidebarMenuButton className="h-12">
                                    <Avatar className="h-8 w-8 mr-2">
                                        <AvatarFallback>
                                            {chat.type === "group" ? <Users className="h-4 w-4" /> : chat.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start justify-center">
                                        <span className="font-medium">{chat.name}</span>
                                    </div>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                          ))}
                      </SidebarMenu>
                  </SidebarGroupContent>
              </SidebarGroup>
          </SidebarContent>
      </Sidebar>);
}