"use server";

import prisma from "@/db";
import { auth } from "@/lib/auth";
import { AccountTypes } from "@prisma/client";
import { revalidatePath } from "next/cache";

type newAccProps = {
    accountNumber: string;
    accountType: AccountTypes;
};

export async function createAccount(newAccount: newAccProps) {
    const session = await auth();

    if (!session?.user || !session.user.id) {
        return { success: false, message: "Not authorized" };
    }

    await prisma.account.create({
        data: {
            accountNumber: newAccount.accountNumber,
            type: newAccount.accountType,
            balance: 0,
            accountHolder: session.user.id,
        },
    });

    revalidatePath("/");

    return {
        success: true,
        message: "account created successfully",
    };
}
