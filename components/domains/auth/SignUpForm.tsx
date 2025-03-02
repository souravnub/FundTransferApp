"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { BankCard } from "@/components/domains/account/BankCard";
import { createUser } from "@/actions/users";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

// Form validation schema
const formSchema = z
    .object({
        username: z.string().min(3, {
            message: "Username must be at least 3 characters.",
        }),
        password: z.string().min(4, {
            message: "Password must be at least 4 characters.",
        }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type FormValues = z.infer<typeof formSchema>;

export default function SignupForm() {
    const [username, setUsername] = useState("");
    const [accountNumber, setAccountNumber] = useState("");

    // Initialize form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        generateAccountNumber();
    }, []);

    const generateAccountNumber = () => {
        const randomNum = Math.floor(100000000 + Math.random() * 900000000);
        setAccountNumber(randomNum.toString());
    };

    // Handle form submission
    const onSubmit = async (values: FormValues) => {
        const { username, password } = values;
        // Here you would typically send the data to your backend
        const res = await createUser({ username, password, accNumber: accountNumber });
        if (res.success) {
            await signIn("credentials", {
                username,
                password,
                redirect: true,
                redirectTo: "/",
            });
        }

        toast(res.message);
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-md">
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Create Your Bank Account</h1>
                    <p className="text-muted-foreground mt-2">Sign up to access our banking services</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your username"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                setUsername(e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Create a password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Confirm your password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full">
                            Create Account
                        </Button>
                    </form>
                </Form>

                <div className="pt-6">
                    <h2 className="text-lg font-medium mb-3">Your Bank Card Preview</h2>
                    <BankCard username={username} accountNumber={accountNumber} />
                </div>
            </div>
        </div>
    );
}
