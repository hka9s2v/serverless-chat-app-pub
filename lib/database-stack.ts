import * as cdk from "aws-cdk-lib";
import { aws_dynamodb } from "aws-cdk-lib";
import { Construct } from "constructs";

export class DatabaseStack extends cdk.Stack {

    readonly table: aws_dynamodb.Table;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        // DynamoDB Table definition
        this.table = new aws_dynamodb.Table(this, "ConnectionsTable", {
            tableName: `connections-table`,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: { name: "connectionId", type: aws_dynamodb.AttributeType.STRING },
            sortKey: { name: "groupId", type: aws_dynamodb.AttributeType.STRING }
        });
    }
}