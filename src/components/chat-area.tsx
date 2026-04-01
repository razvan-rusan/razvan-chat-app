import {useState} from "react";
import {SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Send} from "lucide-react";

interface Message {
    id: number;
    text: string;
    sender: 'them'|'me';
}

const mockMessages: Message[] = [
    { id: 1, text: "Hey! De ce a trecut gaina strada?", sender: "them" },
    { id: 2, text: "Nu stiu, de ce?", sender: "me" },
    { id: 3, text: "Ca sa isi poate termina licenta 😂😂😂", sender: "them" },
    { id: 4, text: "😂😂😂", sender: "me" },
];

export function ChatArea() {
    const [messages, setMessages] = useState<Message[]>(mockMessages);
    const [newMessage, setNewMessage] = useState('');

    const handleSend = (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        setMessages([...messages, {
            id: Date.now(),
            text: newMessage,
            sender: "me"
        }]);
        setNewMessage("");
    }

    return (
      <div className="flex flex-col h-full w-full">
          {/*HEADER Fixed at the top*/}
          <header className="flex items-center h-16 px-4 border-b shrink-0">
            <SidebarTrigger className="mr-4" />
            <h2 className="text-lg font-semibold tracking-tight">Friend1</h2>
          </header>

          {/*MESSAGE FEED Grows to fill middle space*/}
          <ScrollArea className="flex-1 min-h-0 p-4">
              <div className="flex flex-col gap-4">
                  {messages.map((msg) => (
                      <div
                          key={msg.id}
                          className={`max-w-[70%] px-4 py-2 text-sm ${
                              msg.sender === "me"
                              ? "bg-blue-500 text-white self-end rounded-2xl rounded-br-sm"
                              : "bg-gray-100 text-black self-start rounded-2xl rounded-bl-sm"    
                          }`}>
                          {msg.text}
                      </div>
                  ))}
              </div>
          </ScrollArea>

          {/*MESSAGE COMPOSER Fixed at bottom*/}
          <div className="p-4 border-t mt-auto shrink-0">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                  <Input
                      value={newMessage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="shrink-0 rounded-full bg-blue-500 hover:bg-blue-600"
                  >
                      <Send className="h-4 w-4"/>
                      <span className="sr-only">Send message</span>
                  </Button>
              </form>
          </div>

      </div>
    );
}