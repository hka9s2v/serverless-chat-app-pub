import {APIGatewayProxyResult, APIGatewayProxyWebsocketHandlerV2} from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const ddb = new DynamoDBClient();

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
    let response: APIGatewayProxyResult = { statusCode: 200, body: "OK" };
    const putParams = {
        TableName: process.env.CONNECTIONS_TABLE_NAME ?? "",
        Item: {
            connectionId: event.requestContext.connectionId,
            groupId: "dummy"
        },
    }
    await ddb
        .send(new PutCommand(putParams))
        .catch((e) => {
            console.error(e);
            response = { 
                statusCode: 500, 
                body: "connecting error" 
            };
        });

    return response;
};
