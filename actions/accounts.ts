"use server";
import { dbClient } from "@/dynamoDbConfig";
import { auth } from "@/lib/auth";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { revalidatePath } from "next/cache";
import { SendMessageCommandInput, SQS, SQSClientConfig } from "@aws-sdk/client-sqs";

export async function createNewAccount({ accNumber, accType }: { accNumber: string; accType: string }) {
    const session = await auth();

    await dbClient.send(
        new PutCommand({
            TableName: "accounts",
            Item: {
                accHolder: session?.user?.name,
                accNumber,
                type: accType,
                balance: 100,
            },
        })
    );
    revalidatePath("/");
    return { success: true, message: "account created!" };
}

export async function getAllAccountsForUser() {
    const session = await auth();

    const data = await dbClient.send(new ScanCommand({ TableName: "accounts" }));
    const accounts = data.Items;
    return accounts?.filter((acc) => acc.accHolder === session?.user?.name);
}

export async function transferFunds(data: {
    fromAccount: string;
    toAccount: string;
    amount: Number;
    fromHolder: string;
    toHolder: string;
}) {
    const sqs = new SQS({
        region: process.env.REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
        },
    } as SQSClientConfig);
    const params: SendMessageCommandInput = { MessageBody: JSON.stringify(data), QueueUrl: process.env.QUEUE_URL };
    const response = await sqs.sendMessage(params);

    revalidatePath("/");
}
