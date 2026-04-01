import {useState} from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";



export function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (username && password) {
            navigate("/chat");
        }
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <Card className="w-100">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                    Welcome Back
                </CardTitle>
                <CardDescription className="text-center">
                    Enter your credentials to access your chats.
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium">Username</label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="razvan"
                            value={username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">Password</label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="•••••••"
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        />
                    </div>
                </CardContent>

                <CardFooter>
                    <Button type="submit" className="w-full">Log In</Button>
                </CardFooter>
            </form>
        </Card>
      </div>
    );
}