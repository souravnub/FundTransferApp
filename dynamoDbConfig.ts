import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

console.log(process.env.AWS_REGION);

const awsCredentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_SECRET_KEY as string,
};

const dynamoConfig = {
    region: process.env.AWS_REGION,
    credentials: awsCredentials,
};

const dbClient = DynamoDBDocument.from(new DynamoDB(dynamoConfig), {
    marshallOptions: {
        convertEmptyValues: true,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
    },
});

export { dbClient };
