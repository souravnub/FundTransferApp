"use client";
import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LoginForm = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [hidden, setHidden] = useState(true);
    const [passwordType, setPasswordType] = useState("password");

    async function handleLoginFormAction(e: FormEvent) {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const username = formData.get("username") as string | undefined;
        const password = formData.get("password") as string | undefined;

        if (!username || !password) {
            return toast("Please provide all credentials");
        }
        setIsLoading(true);
        const res = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });
        if (res?.error) {
            setIsLoading(false);
            return toast("The credentials provided were incorrect. Please Try with valid credentials", {
                dismissible: true,
            });
        }
        router.push("/");
    }

    return (
        <form className="grid w-full items-center gap-4" onSubmit={handleLoginFormAction}>
            <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" disabled={isLoading} />
            </div>
            <div className="relative">
                <Label htmlFor="password">Password</Label>

                <Input className="w-full" disabled={isLoading} id="password" type={passwordType} name="password" />

                <Label
                    onClick={() => {
                        setHidden(!hidden);
                        setPasswordType(hidden ? "text" : "password");
                    }}
                    className=" absolute right-2 bottom-1 hover:cursor-pointer hover:bg-black hover:text-white p-2 rounded-sm"
                >
                    {hidden ? "show" : "hide"}
                </Label>
            </div>

            <Button type="submit" disabled={isLoading} className="px-8 w-min">
                {isLoading ? "loading..." : "Login"}
            </Button>

            <div>
                <p className="text-sm text-center">
                    Don&#39;t have an account?{" "}
                    <a href="/signup" className="text-primary hover:underline">
                        Sign up
                    </a>
                </p>
            </div>
        </form>
    );
};

export default LoginForm;
