import React, {useState} from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";
import {doc, setDoc } from "firebase/firestore"
import {auth, db} from "@/lib/firebase.ts";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "@firebase/auth";

export function EmailLoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setErrorMessage("");
        if (!email || !password) return;
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCred = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "users", userCred.user.uid), {
                    email: userCred.user.email,
                    displayName: email.split('@')[0],
                })
            }
            navigate("/chat");
        } catch (error: any) {
            console.error("Auth error:", error)
            setErrorMessage(error.message)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
            <Card className="w-100">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        {isLogin ? "Welcome Back" : "Create an Account"}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {isLogin ? "Enter your credentials to access your chats." : "Sign up to start chatting."}
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">

                        {/* Show an error box if Firebase gets mad (e.g., wrong password, email exists) */}
                        {errorMessage && (
                            <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                                {errorMessage}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="razvan@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">Password</label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3">
                        <Button type="submit" className="w-full">
                            {isLogin ? "Log In" : "Sign Up"}
                        </Button>

                        {/* The toggle button */}
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full text-sm"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}