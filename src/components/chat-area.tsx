import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase.ts";
import { User } from "firebase/auth";
import { ChatEntity } from "../App.tsx";

import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { ScrollArea } from "./ui/scroll-area.tsx";
import { SidebarTrigger } from "./ui/sidebar.tsx";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";

import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface MessageEntity {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: any;
}

interface ChatAreaProps {
  currentUser: User;
  chat: ChatEntity;
}

export function ChatArea({ currentUser, chat }: ChatAreaProps) {
  const [messages, setMessages] = useState<MessageEntity[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isInitialLoad = useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!chat.id) return;

    const q = query(
      collection(db, "chats", chat.id, "messages"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const changes = snapshot.docChanges();

      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MessageEntity[];

      setMessages(fetchedMessages);

      if (!isInitialLoad.current) {
        for (const change of changes) {
          if (change.type === "added") {
            const newMsg = change.doc.data() as MessageEntity;

            if (newMsg.senderId !== currentUser.uid) {
              const isWindowFocused = await getCurrentWindow().isFocused();

              if (!isWindowFocused) {
                let permissionGranted = await isPermissionGranted();
                if (!permissionGranted) {
                  const permission = await requestPermission();
                  permissionGranted = permission === "granted";
                }

                const isPerson = chat.type === 'dm';

                if (permissionGranted) {
                  sendNotification({
                    title: (isPerson) ? `New message from ${chat.name || "Somebody"}` : `New message in ${chat.name || "Chat"}`,
                    body: `${newMsg.senderName}: ${newMsg.text}`
                  });
                }
              }
            }
          }
        }
      } else {
        isInitialLoad.current = false;
      }
    }, (error) => {
      console.error("Error fetching messages:", error);
    });

    return () => unsubscribe();
  }, [chat.id]);

  const handleSend = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const textToSend = newMessage;
    setNewMessage("");

    try {
      await addDoc(collection(db, "chats", chat.id, "messages"), {
        text: textToSend,
        senderId: currentUser.uid,
        senderName: currentUser.displayName ||
          currentUser.email?.split("@")[0] || "Unknown",
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "chats", chat.id), {
        lastMessage: textToSend,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center h-16 px-4 border-b shrink-0 bg-background">
        <SidebarTrigger className="mr-4" />
        <h2 className="text-lg font-semibold tracking-tight">
          {chat.name || "Direct Message"}
        </h2>
      </header>

      <ScrollArea className="flex-1 min-h-0 p-4 bg-muted/30">
        <div className="flex flex-col gap-4">
          {messages.length === 0
            ? (
              <div className="text-center text-muted-foreground my-10 text-sm">
                No messages yet. Say hello!
              </div>
            )
            : (
              messages.map((msg, index) => {
                const isMe = msg.senderId === currentUser.uid;

                const isFirstInGroup = index === 0 ||
                  messages[index - 1].senderId !== msg.senderId;

                return (
                  <div
                    key={msg.id}
                    className={`flex w-full ${
                      isMe ? "justify-end" : "justify-start"
                    } ${isFirstInGroup ? "mt-4" : "mt-1"}`}
                  >
                    {!isMe && (
                      <div className="w-8 mr-2 flex items-start shrink-0">
                        {isFirstInGroup && (
                          <Avatar className="w-8 h-8 mt-0.5 shadow-sm">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground font-medium">
                              {msg.senderName
                                ? msg.senderName.charAt(0).toUpperCase()
                                : "?"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )}

                    <div
                      className={`max-w-[70%] px-4 py-2 text-sm shadow-sm flex flex-col ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                          : "bg-background text-foreground rounded-2xl rounded-tl-sm border"
                      }`}
                    >
                      {!isMe && isFirstInGroup && chat.type === "group" && (
                        <span className="text-xs font-semibold text-primary mb-1">
                          {msg.senderName || "Unknown"}
                        </span>
                      )}
                      <span>{msg.text}</span>
                    </div>
                  </div>
                );
              })
            )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t mt-auto shrink-0 bg-background">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full"
            autoFocus
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0 rounded-full bg-primary hover:bg-primary/90 shadow-sm text-primary-foreground"
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
