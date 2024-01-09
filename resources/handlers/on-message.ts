import { APIGatewayProxyResult, APIGatewayProxyWebsocketHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import * as AWS from "aws-sdk";

const ddb = new DynamoDBClient();

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
    let response: APIGatewayProxyResult = { statusCode: 200, body: "OK" };
    let errorResponse: APIGatewayProxyResult = { statusCode: 500, body: "internal server error" };
    const groupId = JSON.parse(event.body ?? "{}").groupId;
    let connections;
    // Fetch all connections.
    try {
        connections = (
            await ddb.send(new ScanCommand({ TableName: process.env.CONNECTIONS_TABLE_NAME ?? "" }))
        ).Items as { connectionId: string, groupId?: string, username?: string }[];
    } catch (e) {
        console.warn(e);
        return errorResponse;
    }

    const senderName = connections.filter(item => item.connectionId === event.requestContext.connectionId && item.groupId == groupId).map(item => item.username);

    const sendMessages = connections.map(async (item) => {
        let isOwnMessage = false;
        if (item.connectionId === event.requestContext.connectionId) isOwnMessage = true;
        console.debug("connectionId:" + item.connectionId + ",groupId:" + item.groupId)
        // Create post data for those with the same group ID as the request. 
        if (item.groupId === groupId) {
            await new AWS.ApiGatewayManagementApi({ apiVersion: '2018-11-29', endpoint: event.requestContext.domainName + "/" + event.requestContext.stage })
                .postToConnection({
                    ConnectionId: item.connectionId,
                    Data: JSON.stringify({
                        message: JSON.parse(event.body ?? "{}").message,
                        username: senderName,
                        isOwnMessage: isOwnMessage
                    })
                })
                .promise()
                .catch(e => console.warn(e));
        }
    });

    await Promise
        .all(sendMessages)
        .catch((e) => {
            console.warn(e);
            return errorResponse;
        });

    return response;
};
