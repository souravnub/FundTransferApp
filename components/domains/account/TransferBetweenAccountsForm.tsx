"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight } from "lucide-react";
import { getAllAccountsForUser, transferFunds } from "@/actions/accounts";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const formSchema = z
    .object({
        fromAccount: z.string({
            required_error: "Please select an account to transfer from",
        }),
        toAccount: z.string({
            required_error: "Please select an account to transfer to",
        }),
        amount: z.coerce
            .number({
                required_error: "Please enter an amount",
                invalid_type_error: "Please enter a valid number",
            })
            .positive("Amount must be greater than 0"),
    })
    .refine((data) => data.fromAccount !== data.toAccount, {
        message: "From and To accounts must be different",
        path: ["toAccount"],
    });

export default function TransferDialog() {
    const [open, setOpen] = useState(false);
    const [accounts, setAccounts] = useState<undefined | Record<string, any>[]>(undefined);
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();

    async function fetchAccounts() {
        const fetchedAccounts = await getAllAccountsForUser();
        setAccounts(fetchedAccounts);
    }

    useEffect(() => {
        fetchAccounts();
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 0,
        },
    });

    const fromAccountNumber = form.watch("fromAccount");
    const fromAccount = accounts?.find((acc) => acc.accNumber === fromAccountNumber);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!session) {
            return "unauthorized";
        }
        if (fromAccount?.balance <= values.amount) {
            return toast("Insufficient funds to transfer");
        }

        setLoading(true);

        await transferFunds({
            ...values,
            fromHolder: session?.user?.name as string,
            toHolder: session?.user?.name as string,
        });

        toast("Transfer request has been initiated");
        setLoading(false);

        form.reset();
        setOpen(false);

        setTimeout(() => {
            fetchAccounts();
        }, 1000);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    Exchange between accounts <ArrowLeftRight />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Transfer Funds</DialogTitle>
                    <DialogDescription>
                        Move money between your accounts. Click submit when you're done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="fromAccount"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>From Account</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select account" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {accounts?.map((account) => (
                                                <SelectItem key={account.accNumber} value={account.accNumber}>
                                                    <div className="flex flex-col">
                                                        <span className="w-min">{account.type}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {account.accNumber} · $
                                                            {account.balance.toLocaleString("en-US", {
                                                                minimumFractionDigits: 2,
                                                            })}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fromAccount && (
                                        <FormDescription>
                                            Available balance: $
                                            {fromAccount.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="toAccount"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>To Account</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select account" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {accounts?.map((account) => (
                                                <SelectItem key={account.accNumber} value={account.accNumber}>
                                                    <div className="flex flex-col">
                                                        <span className="w-min">{account.type}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {account.accNumber}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                $
                                            </span>
                                            <Input
                                                placeholder="0.00"
                                                {...field}
                                                className="pl-8"
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Transfering..." : "Transfer"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
