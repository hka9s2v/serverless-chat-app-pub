import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class S3stack extends Stack {
    public readonly distribution: cloudfront.Distribution;
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const bucket = new s3.Bucket(this, 'S3Bucket', {
            bucketName: "serverless-chat-app-s3-bucket",
            removalPolicy: RemovalPolicy.DESTROY,
            websiteIndexDocument: 'index.html',
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
        });

        const oai = new cloudfront.OriginAccessIdentity(this, 'ServerlessChatOAI')

        bucket.grantRead(oai)

        const distribution = new cloudfront.CloudFrontWebDistribution(this, 'ServerlessChatDistribution', {
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: bucket,
                        originAccessIdentity: oai
                    },
                    behaviors: [{
                        isDefaultBehavior: true,
                        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
                    }]
                }
            ],
            errorConfigurations: [{
                errorCode: 404,
                responseCode: 200,
                responsePagePath: '/index.html',
            }],
            viewerCertificate: cloudfront.ViewerCertificate.fromCloudFrontDefaultCertificate()
        })

        new s3deploy.BucketDeployment(this, 'ServerlessChatBucketDeployment', {
            sources: [s3deploy.Source.asset('./client/build')],
            destinationBucket: bucket,
            distribution: distribution,
            distributionPaths: ['/*'],
        })
    }
}
