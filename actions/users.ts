"use server";
import { dbClient } from "@/dynamoDbConfig";
import { GetCommand, PutCommand, ScanCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";

export async function getUser(username: string) {
    const res = await dbClient.send(new GetCommand({ TableName: "users", Key: { username } }));
    return res.Item;
}
export async function getAllUserAccounts(username: string) {
    const res = await dbClient.send(new ScanCommand({ TableName: "accounts" }));
    const accounts = res.Items?.filter((item) => {
        return item.accHolder === username;
    });
    return accounts;
}
export async function createUser(data: { username: string; password: string; accNumber: string }) {
    const user = await dbClient.send(new GetCommand({ TableName: "users", Key: { username: data.username } }));
    if (user.Item) {
        return { success: false, message: "Username already exists" };
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(data.password, salt);

    await dbClient.send(
        new TransactWriteCommand({
            TransactItems: [
                {
                    Put: {
                        TableName: "users",
                        Item: {
                            username: data.username,
                            password: hash,
                        },
                    },
                },
                {
                    Put: {
                        TableName: "accounts",
                        Item: {
                            accNumber: data.accNumber,
                            accHolder: data.username,
                            balance: 100,
                            type: "SAVINGS",
                        },
                    },
                },
            ],
        })
    );

    return {
        success: true,
        message: "Singed Up successfully! Please login",
        user: { username: data.username, password: hash },
    };
}
