"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

import { Label } from "@/components/ui/label";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAccount } from "@/actions/account";
import { toast } from "sonner";
import { AccountTypes } from "@prisma/client";
import { Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const AddAccountForm = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [accNumber, setAccNumber] = useState<undefined | string>(undefined);
    const [accType, setAccType] = useState<AccountTypes>("CHECKING");
    const [loading, setIsLoading] = useState(false);

    async function handleAddAccount(e: React.FormEvent) {
        e.preventDefault();

        if (!accNumber || !accType) {
            return toast("Both account Number & account Type are required");
        }

        setIsLoading(true);
        const createAccountRes = await createAccount({ accountNumber: accNumber, accountType: accType });
        setIsLoading(false);

        if (createAccountRes.success) {
            setIsDialogOpen(false);
            setAccNumber(undefined);
            setAccType("CHECKING");
            return toast("New Account created!!");
        }

        toast(`Error while creating new account: ${createAccountRes.message}`);
    }
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Plus />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Add new account</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add a new account</DialogTitle>
                    <DialogDescription>** New accounts will start with a balance of 0</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleAddAccount}>
                    <div className="space-y-1">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <InputOTP
                            onChange={setAccNumber}
                            value={accNumber}
                            id="accountNumber"
                            maxLength={9}
                            pattern={REGEXP_ONLY_DIGITS}
                        >
                            <InputOTPGroup className="w-full">
                                <InputOTPSlot className="flex-1" index={0} />
                                <InputOTPSlot className="flex-1" index={1} />
                                <InputOTPSlot className="flex-1" index={2} />
                                <InputOTPSlot className="flex-1" index={3} />
                                <InputOTPSlot className="flex-1" index={4} />
                                <InputOTPSlot className="flex-1" index={5} />
                                <InputOTPSlot className="flex-1" index={6} />
                                <InputOTPSlot className="flex-1" index={7} />
                                <InputOTPSlot className="flex-1" index={8} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="accountType">Account Type</Label>
                        <Select onValueChange={(val) => setAccType(val as AccountTypes)} value={accType}>
                            <SelectTrigger id="accountType">
                                <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="CHECKING">Checking</SelectItem>
                                    <SelectItem value="SAVINGS">Savings</SelectItem>
                                    <SelectItem value="INVESTMENT">Investment</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button disabled={loading} type="submit" className=" bg-blue-600  text-white hover:bg-blue-800">
                        {loading ? "Creating..." : "Create"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddAccountForm;
