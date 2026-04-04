import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle

} from "./ui/dialog.tsx";
import {useState} from "react";
import {Plus, Search} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import {Button} from "@/components/ui/button.tsx";

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const recommendedFriends = [
    { id: "user1", name: "Alice Green", email: "alice@email.com" },
    { id: "user2", name: "Bob Johnson", email: "bob@email.com" },
    { id: "user3", name: "Charlie Brown", email: "charlie@email.com" },
    { id: "user4", name: "David Kim", email: "david@email.com" },
    { id: "user5", name: "Eve Davis", email: "eve@email.com" },
];

export function CreateGroupModal({ isOpen, onClose }: AddUserModalProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const handleDone = () => {
        onClose();
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
                <DialogTitle>Add User</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                    <Input
                        id="search"
                        placeholder="Search & add friends to new group..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 rounded-full"
                    />
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground">Recommended for You</h4>
                    <ScrollArea className="h-62.5 pr-3">
                        <div className="space-y-3">
                            {recommendedFriends.map((friend) => (
                                <div key={friend.id} className="flex items-center justify-between p-2 rounded-lg border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                         <AvatarFallback>
                                             {friend.name.charAt(0).toUpperCase()}
                                         </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">
                                                {friend.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {friend.email}
                                            </span>
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="rounded-full">
                                        <Plus className="h-4 w-4" />
                                        <span className="sr-only">Add {friend.name}</span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea></div>
            </div>

              <DialogFooter>
                  <Button onClick={handleDone} className="rounded-full">
                      Done
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    );
}