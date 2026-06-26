import React, {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";
import {doc, setDoc } from "firebase/firestore"
import {auth, db} from "@/lib/firebase.ts";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    UserCredential
} from "@firebase/auth";
import {WaveBackground} from "@/pages/wave-background.tsx";
// @ts-ignore
import testNotificationSystem from "@/lib/testnotifs.ts";

export function LoginPage() {
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
                const userCred: UserCredential = await createUserWithEmailAndPassword(auth, email, password);

                const generatedName = email.split('@')[0];

                await updateProfile(userCred.user, {
                    displayName: generatedName
                });

                await setDoc(doc(db, "users", userCred.user.uid), {
                    email: userCred.user.email,
                    displayName: generatedName,
                })
            }
            navigate("/chat");
        } catch (error: any) {
            console.error("Auth error:", error)
            setErrorMessage(error.message)
        }
    }

    useEffect(() => {
        testNotificationSystem();
    },[]);

    return (
        <>
            <WaveBackground/>
            <div className="flex items-center justify-center min-h-screen bg-muted/50">
                <Card className="w-100 relative z-10 shadow-2xl bg-card/90 backdrop-blur-xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center text-card-foreground">
                            {isLogin ? "Welcome Back" : "Create an Account"}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {isLogin ? "Enter your credentials to access your chats." : "Sign up to start chatting."}
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">

                            {/* Arata o eroare daca Firebase face fite (gen parola gresita, email deja folosit) */}
                            {errorMessage && (
                                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
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

                            {/* Button-ul de toggle */}
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
        </>
    )
}