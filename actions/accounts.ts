"use server";
import { dbClient } from "@/dynamoDbConfig";
import { auth } from "@/lib/auth";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { revalidatePath } from "next/cache";

export async function createNewAccount({ accNumber, accType }: { accNumber: string; accType: string }) {
    const session = await auth();

    await dbClient.send(
        new PutCommand({
            TableName: "accounts",
            Item: {
                accHolder: session?.user?.name,
                accNumber,
                type: accType,
                balance: 0,
            },
        })
    );
    revalidatePath("/");
    return { success: true, message: "account created!" };
}
