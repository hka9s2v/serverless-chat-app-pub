import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import {APIGatewayProxyResult, APIGatewayProxyWebsocketHandlerV2} from "aws-lambda";

const ddb = new DynamoDBClient();

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
    const groupId = JSON.parse(event.body ?? "{}").groupId;
    const username = JSON.parse(event.body ?? "{}").username;
    let response: APIGatewayProxyResult = { statusCode: 200, body: "OK" };
    const putParams = {
        TableName: process.env.CONNECTIONS_TABLE_NAME ?? "",
        Item: {
            connectionId: event.requestContext.connectionId,
            groupId,
            username
        }
    }
    await ddb
        .send(new PutCommand(putParams))
        .catch((e: any) => {
            console.error(e);
            response = { 
                statusCode: 500, 
                body: "connecting error" 
            };
        });

    return response;
};