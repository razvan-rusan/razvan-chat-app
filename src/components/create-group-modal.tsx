import { useState } from "react";
import { X } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase.ts";
import { User } from "firebase/auth";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { SearchedUser, UserSearch } from "./user-search.tsx";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User; // We need the current user to add them to the group!
}

export function CreateGroupModal(
  { isOpen, onClose, currentUser }: CreateGroupModalProps,
) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<SearchedUser[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = (user: SearchedUser) => {
    // Prevent adding the same person twice
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleCreateGroup = async () => {
    if (selectedUsers.length === 0) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "chats"), {
        type: "group",
        name: groupName.trim() || "New Group",
        participants: [currentUser.uid, ...selectedUsers.map((u) => u.id)],
        lastMessage: "Group created",
        updatedAt: serverTimestamp(),
      });

      setGroupName("");
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const usersToExclude = [currentUser.uid, ...selectedUsers.map((u) => u.id)];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Input
            placeholder="Group Name (Optional)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="rounded-xl"
          />

          <UserSearch
            onSelectUser={handleAddUser}
            excludeIds={usersToExclude}
            placeholder="Search to add friends..."
          />

          <div className="space-y-4 mt-2">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Participants ({selectedUsers.length})
            </h4>
            <ScrollArea className="h-48 pr-3">
              {selectedUsers.length === 0
                ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No users added yet.
                  </div>
                )
                : (
                  <div className="space-y-2">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 rounded-lg border bg-card text-card-foreground"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {user.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm leading-none">
                              {user.displayName}
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">
                              {user.email}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">
                            Remove {user.displayName}
                          </span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleCreateGroup}
            className="rounded-full w-full sm:w-auto"
            disabled={selectedUsers.length === 0 || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
