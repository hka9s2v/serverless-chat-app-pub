import { WebSocketLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as cdk from "aws-cdk-lib";
import { aws_dynamodb, aws_lambda_nodejs } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { WebSocketApi, WebSocketStage } from "@aws-cdk/aws-apigatewayv2-alpha/lib/websocket";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

export interface WebSocketApiStackProps extends cdk.StackProps {
    readonly table: aws_dynamodb.Table;
}

export class WebSocketApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: WebSocketApiStackProps) {
        super(scope, id, props);

        // Lambda handler definition
        const connectHandler = new aws_lambda_nodejs.NodejsFunction(this, "OnConnectHandler", {
            environment: {
                CONNECTIONS_TABLE_NAME: props.table.tableName,
            },
            runtime: Runtime.NODEJS_18_X,
            entry: "resources/handlers/on-connect.ts",
            logRetention: RetentionDays.ONE_WEEK,
        });

        const disconnectHandler = new aws_lambda_nodejs.NodejsFunction(this, "OnDisconnectHandler", {
            environment: {
                CONNECTIONS_TABLE_NAME: props.table.tableName,
            },
            runtime: Runtime.NODEJS_18_X,
            entry: "resources/handlers/on-disconnect.ts",
            logRetention: RetentionDays.ONE_WEEK,
        });

        const onMessageHandler = new aws_lambda_nodejs.NodejsFunction(this, "OnMessageHandler", {
            environment: {
                CONNECTIONS_TABLE_NAME: props.table.tableName,
            },
            runtime: Runtime.NODEJS_18_X,
            entry: "resources/handlers/on-message.ts",
            logRetention: RetentionDays.ONE_WEEK,
        });

        const onEnterRoomHandler = new aws_lambda_nodejs.NodejsFunction(this, "OnEnterRoomHandler", {
            environment: {
                CONNECTIONS_TABLE_NAME: props.table.tableName,
            },
            runtime: Runtime.NODEJS_18_X,
            entry: "resources/handlers/on-enter-room.ts",
            logRetention: RetentionDays.ONE_WEEK,
        });

        props.table.grantReadWriteData(connectHandler);
        props.table.grantReadWriteData(disconnectHandler);
        props.table.grantReadWriteData(onEnterRoomHandler);
        props.table.grantReadWriteData(onMessageHandler);

        // WebSocket API definition
        const webSocketApi = new WebSocketApi(this, "MessageApi", {
            routeSelectionExpression: "$request.body.action",
            connectRouteOptions: {
                integration: new WebSocketLambdaIntegration("MessageApiConnectIntegration", connectHandler),
            },
            disconnectRouteOptions: {
                integration: new WebSocketLambdaIntegration("MessageApiDisconnectIntegration", disconnectHandler),
            },
        });

        webSocketApi.addRoute("on-enter-room", {
            integration: new WebSocketLambdaIntegration("MessageApiSendIntegration", onEnterRoomHandler),
        });

        webSocketApi.addRoute("on-message", {
            integration: new WebSocketLambdaIntegration("MessageApiSendIntegration", onMessageHandler),
        });

        webSocketApi.grantManageConnections(onEnterRoomHandler);
        webSocketApi.grantManageConnections(onMessageHandler);

        new WebSocketStage(this, "MessageApiProd", {
            webSocketApi,
            stageName: "test",
            autoDeploy: true,
        });
    }
}
