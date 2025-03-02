"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getDefaultAccountsOfUsers, transferFunds as transferFundAction } from "@/actions/accounts";
import { useSession } from "next-auth/react";

// Define the form schema with validation
const formSchema = z.object({
    recipient: z.string().nonempty("rqeuire"),
    amount: z.coerce.number().positive("Amount must be positive").min(0.01, "Minimum transfer amount is 0.01"),
});

type FormValues = z.infer<typeof formSchema>;

// Mock function to simulate a transfer - replace with actual server action
async function transferFunds(
    data: FormValues & { defaultAccOfCurrentUser: string; accHolder: string; recipientAccNumber: string }
) {
    // This would be a server action in a real application
    await transferFundAction({
        fromAccount: data.defaultAccOfCurrentUser,
        toHolder: data.recipient,
        fromHolder: data.accHolder,
        toAccount: data.recipientAccNumber,
        amount: data.amount,
    });
}

export function TransferToUserForm({ amountInDefaultAcc }: { amountInDefaultAcc: number }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<"form" | "confirm" | "success">("form");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [users, setUsers] = useState<any[] | undefined>(undefined);
    const [defaultAccOfCurrentUser, setDefaultAccOfCurrentUser] = useState<null | string>(null);
    const [recipientAccNumber, setRecipientAccNumber] = useState<string | null>(null);
    const { data: session } = useSession();

    // Initialize form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            recipient: "",
            amount: 0,
        },
    });

    const onSubmit = async (data: FormValues) => {
        if (amountInDefaultAcc <= data.amount) {
            toast("Insufficient funds to transfer");
            return;
        }

        if (step === "form") {
            // Move to confirmation step
            setStep("confirm");
            return;
        }

        if (step === "confirm") {
            setIsSubmitting(true);
            try {
                if (!defaultAccOfCurrentUser) return;
                if (!session || !session.user || !session.user.name) return;
                if (!recipientAccNumber) return;
                await transferFunds({
                    ...data,
                    defaultAccOfCurrentUser,
                    accHolder: session?.user?.name,
                    recipientAccNumber,
                });
                setStep("success");
                toast(`$${data.amount.toFixed(2)} has been sent to ${data.recipient}`);
            } catch (error) {
                toast("An unknown error occurred");
                // Reset to form step on error
                setStep("form");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const resetDialog = () => {
        setStep("form");
        form.reset();
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            // Reset the dialog state when it's closed
            setTimeout(resetDialog, 300);
        }
    };

    async function getAndSetUsers() {
        const defaultAccounts = await getDefaultAccountsOfUsers();
        setUsers(defaultAccounts);
    }
    useEffect(() => {
        getAndSetUsers();
    }, []);

    useEffect(() => {
        const currentUserDefaultAccNumber = users?.find((acc) => acc.accHolder === session?.user?.name)?.accNumber;
        setDefaultAccOfCurrentUser(currentUserDefaultAccNumber);
    }, [session, users?.length]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>Transfer Funds</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                {step === "form" && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Transfer Funds</DialogTitle>
                            <DialogDescription>
                                Send money to another user. Enter the recipient and amount below.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="recipient"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Recipient</FormLabel>
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    const toAccNumber = users?.find(
                                                        (user) => user.accHolder === val
                                                    ).accNumber;
                                                    setRecipientAccNumber(toAccNumber);
                                                }}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a recipient" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {users
                                                        ?.filter((user) => user.accHolder !== session?.user?.name)
                                                        .map((user) => (
                                                            <SelectItem key={user.accHolder} value={user.accHolder}>
                                                                {user.accHolder}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Select the user you want to send money to.
                                            </FormDescription>
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
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                        <span className="text-gray-500">$</span>
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        className="pl-7"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormDescription>Enter the amount you want to transfer.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="submit">Continue</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </>
                )}

                {step === "confirm" && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Confirm Transfer</DialogTitle>
                            <DialogDescription>Please review the transfer details before confirming.</DialogDescription>
                        </DialogHeader>
                        <div className="py-6">
                            <div className="rounded-lg bg-muted p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="text-sm text-muted-foreground">From</div>
                                    <div className="font-medium">Your Account</div>
                                </div>
                                <div className="flex justify-center my-2">
                                    <ArrowRight className="text-muted-foreground" />
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="text-sm text-muted-foreground">To</div>
                                    <div className="font-medium">
                                        {
                                            (users?.find((user) => user.accHolder === form.getValues().recipient))
                                                .accHolder
                                        }
                                    </div>
                                </div>
                                <div className="border-t pt-4 mt-2">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-muted-foreground">Amount</div>
                                        <div className="text-xl font-bold">
                                            ${Number.parseFloat(form.getValues().amount.toString()).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={() => setStep("form")} disabled={isSubmitting}>
                                Back
                            </Button>
                            <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Confirm Transfer"
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === "success" && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Transfer Successful</DialogTitle>
                            <DialogDescription>Your funds have been transferred successfully.</DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center py-8">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                            <p className="text-center text-lg font-medium">
                                ${Number.parseFloat(form.getValues().amount.toString()).toFixed(2)} has been sent to{" "}
                                {(users?.find((user) => user.accHolder === form.getValues().recipient)).accHolder}
                            </p>
                            <p className="text-center text-sm text-muted-foreground mt-2">
                                The transaction has been completed and a receipt has been sent to your email.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setOpen(false)}>Close</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
