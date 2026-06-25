import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Search, UserIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command.tsx";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase.ts";

export interface SearchedUser {
  id: string;
  email: string;
  displayName: string;
}

interface UserSearchProps {
  onSelectUser: (user: SearchedUser) => void;
  excludeIds?: string[];
  placeholder?: string;
}

export function UserSearch(
  { onSelectUser, excludeIds = [], placeholder = "Search users..." }:
    UserSearchProps,
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchedUser[]>([]);

  const excludeIdsString = excludeIds.join(",");

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
          limit(5),
        );

        const snapshot = await getDocs(q);
        const results = snapshot.docs
          .map((doc) => ({
            id: doc.id, // We MUST extract the ID for the modal to work
            email: doc.data().email,
            displayName: doc.data().displayName, // Matching your Firestore!
          }))
          .filter((u) => !excludeIds.includes(u.id));

        setSuggestions(results);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    fetchSuggestions();
  }, [searchQuery, excludeIdsString]);

  const handleSelect = (user: SearchedUser) => {
    setOpen(false);
    setSearchQuery("");
    onSelectUser(user);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-start text-muted-foreground font-normal h-9"
        >
          <Search className="mr-2 h-4 w-4 shrink-0" />
          {searchQuery || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
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
                  onSelect={() => handleSelect(suggestion)}
                  className="cursor-pointer"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{suggestion.displayName}</span>
                    <span className="text-xs text-muted-foreground">
                      {suggestion.email}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
