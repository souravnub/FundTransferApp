import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ClientSessionProvider from "@/hooks/ClientSessionProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Payment app",
    description: "A demo payment app that let's you transfer money to other people.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <ClientSessionProvider>
                <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                    {children}
                    <Toaster />
                </body>
            </ClientSessionProvider>
        </html>
    );
}
