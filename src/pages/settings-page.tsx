import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@firebase/auth";
import { Button } from "../components/ui/button.tsx";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

interface SettingsPageProps {
  user: User;
}

// @ts-ignore Poate folosesc acest prop `user` cand adaug sa iti customizezi profilul
export function SettingsPage({ user }: SettingsPageProps) {
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-muted/30 p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
          onClick={() => navigate("/chat")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Chats
        </Button>

        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile, appearance, and app preferences.
          </p>
        </div>

        {/* Card cu Appearance*/}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the application looks on your device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium leading-none">Theme</span>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark mode.
                </p>
              </div>

              {/* Butoane de Toggle pt Tema */}
              <div className="flex items-center gap-2 border rounded-full p-1 bg-muted/50">
                <Button
                  variant={!isDarkMode ? "secondary" : "ghost"}
                  size="sm"
                  className={`rounded-full ${!isDarkMode ? "shadow-sm" : ""}`}
                  onClick={() => setIsDarkMode(false)}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={isDarkMode ? "secondary" : "ghost"}
                  size="sm"
                  className={`rounded-full ${isDarkMode ? "shadow-sm" : ""}`}
                  onClick={() => setIsDarkMode(true)}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder pentru optiunile de personalizare */}
        <Card className="opacity-50 pointer-events-none">
          <CardHeader>
            <CardTitle>Profile Customization</CardTitle>
            <CardDescription>
              Change your avatar color and display name (Coming soon).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-10 bg-muted rounded-md w-full animate-pulse">
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
