import { APIGatewayProxyResult, APIGatewayProxyWebsocketHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddb = new DynamoDBClient();

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
    let response: APIGatewayProxyResult = { statusCode: 200, body: "OK" };
    let errorResponse: APIGatewayProxyResult = { statusCode: 500, body: "internal server error" };
    const queryParams = {
        TableName: process.env.CONNECTIONS_TABLE_NAME ?? "",
        KeyConditionExpression: "connectionId = :partitionkeyval",
        ExpressionAttributeValues: {
            ":partitionkeyval": event.requestContext.connectionId,
        },
        ProjectionExpression: "groupId"
    }
    let groupIds;
    try {
        groupIds = (await ddb.send(new QueryCommand(queryParams))).Items as { groupId: string }[];
    } catch (e) {
        console.warn(e);
        return errorResponse;
    }

    const promises = groupIds.map((item) => {
        console.log(item.groupId)
        const deleteParams = {
            TableName: process.env.CONNECTIONS_TABLE_NAME ?? "",
            Key: {
                connectionId: event.requestContext.connectionId,
                groupId: item.groupId
            },
        }
        ddb.send(new DeleteCommand(deleteParams))
    })

    await Promise.all(promises)
        .catch((e) => {
            console.warn(e);
            return errorResponse;
        });
    return response;

};
