import { dbClient } from "@/dynamoDbConfig";
import { GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

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
