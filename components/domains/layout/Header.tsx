"use client";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { signOut } from "next-auth/react";
import React from "react";

const Header = () => {
    return (
        <header className="sticky top-0 z-10 bg-white shadow-sm">
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">MyBank</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Button onClick={() => signOut()}>Logout</Button>
                </div>
            </div>
        </header>
    );
};

export default Header;
