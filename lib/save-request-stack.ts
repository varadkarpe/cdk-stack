import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import * as apigateway from '@aws-cdk/aws-apigateway';



export default class SaveRequestStack extends cdk.Stack {
  public constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Stack defining code
    const requestTable = new dynamodb.Table(this,
        'user-table',
        {
            tableName: 'users',
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });
        
        const requestHandler = new lambda.Function(this,
            'request-handler',
            {
                runtime: lambda.Runtime.NODEJS_14_X,
                handler: 'app.lambda_handler',
                functionName: 'insert-request',
                environment: {
                    "USERS": requestTable.tableName
                },
                description: "Request handler to insert a request into DynamoDB. Triggered by API Gateway.",
                code: lambda.Code.fromAsset('./request-handler'),
            });
        
        requestHandler.addToRolePolicy(new iam.PolicyStatement({
                actions: ['dynamodb:PutItem'],
                resources: [requestTable.tableArn],
            }));
        
            const requestRestApi = new apigateway.LambdaRestApi(this,
                'request-api',
                {
                  proxy: false,
                  handler: requestHandler,
                },
              );
              
            const requestRestApiSendResource = requestRestApi.root.addResource('send');
              
            const badRequestResponse: apigateway.IntegrationResponse = { statusCode: "400" };
            const internalServerResponse: apigateway.IntegrationResponse = { statusCode: "500" };
            const okResponse: apigateway.IntegrationResponse = { statusCode: "200" };
               
            const requestRestApiLambdaIntegration = new apigateway.LambdaIntegration(requestHandler, {
                integrationResponses: [
                  badRequestResponse,
                  internalServerResponse,
                  okResponse,
                ],
            });
              
            requestRestApiSendResource.addMethod('POST', requestRestApiLambdaIntegration);
  }
}