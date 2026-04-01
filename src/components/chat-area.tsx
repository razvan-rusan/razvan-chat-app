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

// Define what a message looks like in our database
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

  // This ref helps us auto-scroll to the bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Auto-scroll function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll every time the messages array changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 2. REAL-TIME MESSAGE LISTENER
  useEffect(() => {
    if (!chat.id) return;

    // Look inside this specific chat's "messages" subcollection, ordered by time
    const q = query(
      collection(db, "chats", chat.id, "messages"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MessageEntity[];

      setMessages(fetchedMessages);
    }, (error) => {
      console.error("Error fetching messages:", error);
    });

    return () => unsubscribe();
  }, [chat.id]); // Re-run this effect if the user clicks a different chat in the sidebar!

  // 3. SEND MESSAGE LOGIC
  const handleSend = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const textToSend = newMessage;
    setNewMessage(""); // Optimistically clear the input instantly for good UX

    try {
      // A. Add the message to the subcollection
      await addDoc(collection(db, "chats", chat.id, "messages"), {
        text: textToSend,
        senderId: currentUser.uid,
        senderName: currentUser.displayName ||
          currentUser.email?.split("@")[0] || "Unknown",
        createdAt: serverTimestamp(),
      });

      // B. Update the parent chat document so the Sidebar updates!
      // This ensures the sidebar shows the latest message preview and bumps the chat to the top
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
      {/* HEADER */}
      <header className="flex items-center h-16 px-4 border-b shrink-0 bg-white">
        <SidebarTrigger className="mr-4" />
        <h2 className="text-lg font-semibold tracking-tight">
          {chat.name || "Direct Message"}
        </h2>
      </header>

      {/* MESSAGE FEED */}
      <ScrollArea className="flex-1 min-h-0 p-4 bg-gray-50/30">
        <div className="flex flex-col gap-4">
          {messages.length === 0
            ? (
              <div className="text-center text-gray-500 my-10 text-sm">
                No messages yet. Say hello!
              </div>
            )
            : (
              messages.map((msg, index) => {
                // Check if the message is mine or theirs
                const isMe = msg.senderId === currentUser.uid;

                const isFirstInGroup = index === 0 ||
                  messages[index - 1].senderId !== msg.senderId;

                return (
                  <div
                    key={msg.id}
                    // 1. OUTER WRAPPER: Pure flex layout. No padding, no max-width!
                    className={`flex w-full ${
                      isMe ? "justify-end" : "justify-start"
                    } ${isFirstInGroup ? "mt-4" : "mt-1"}`}
                  >
                    {/* 2. AVATAR CONTAINER: Fixed width space. Only renders for other people. */}
                    {!isMe && (
                      <div className="w-8 mr-2 flex items-start shrink-0">
                        {isFirstInGroup && (
                          <Avatar className="w-8 h-8 mt-0.5 shadow-sm">
                            <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 font-medium">
                              {msg.senderName
                                ? msg.senderName.charAt(0).toUpperCase()
                                : "?"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )}

                    {/* 3. THE ACTUAL BUBBLE: Visuals and constraints live here. */}
                    <div
                      className={`max-w-[70%] px-4 py-2 text-sm shadow-sm flex flex-col ${
                        isMe
                          ? "bg-blue-500 text-white rounded-2xl rounded-tr-sm"
                          : "bg-white text-black rounded-2xl rounded-tl-sm border"
                      }`}
                    >
                      {/* If it's a group chat, show their name in tiny text above their first message */}
                      {!isMe && isFirstInGroup && chat.type === "group" && (
                        <span className="text-xs font-semibold text-gray-500 mb-1">
                          {msg.senderName || "Unknown"}
                        </span>
                      )}
                      <span>{msg.text}</span>
                    </div>
                  </div>
                );
              })
            )}
          {/* This empty div is our scroll target */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* COMPOSER */}
      <div className="p-4 border-t mt-auto shrink-0 bg-white">
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
            className="shrink-0 rounded-full bg-blue-500 hover:bg-blue-600 shadow-sm"
            disabled={!newMessage.trim()} // Disable button if input is empty
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
