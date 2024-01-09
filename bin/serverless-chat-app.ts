#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebSocketApiStack } from '../lib/websocket-api-stack';
import { DatabaseStack } from '../lib/database-stack';
import { S3stack } from '../lib/s3-stack';

const app = new cdk.App();

const databaseStack = new DatabaseStack(app,'DatabaseStack')

new WebSocketApiStack(app, 'WebSocketApiStack', {
    table: databaseStack.table
});

new S3stack(app, 'S3Stack')