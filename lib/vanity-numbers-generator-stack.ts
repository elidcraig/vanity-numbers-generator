import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as connect from "aws-cdk-lib/aws-connect";
import contactFlowData from "../flows/vanity-number-contact-flow.json";
import * as path from "path";

export class VanityNumbersGeneratorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vanityTable = new dynamodb.Table(this, "VanityTable", {
      partitionKey: {
        name: "phoneNumber",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const vanityLambda = new lambda.Function(this, "VanityLambda", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "handler.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
      environment: {
        TABLE_NAME: vanityTable.tableName,
      },
    });

    vanityTable.grantWriteData(vanityLambda);

    const vanityConnect = new connect.CfnInstance(this, "VanityConnect", {
      instanceAlias: "vanity-number-connect-instance",
      attributes: {
        inboundCalls: true,
        outboundCalls: false,
        autoResolveBestVoices: false,
        contactflowLogs: true,
      },
      identityManagementType: "CONNECT_MANAGED",
    });

    const vanityLambdaAssociation = new connect.CfnIntegrationAssociation(
      this,
      "VanityLambdaIntegration",
      {
        instanceId: vanityConnect.attrArn,
        integrationArn: vanityLambda.functionArn,
        integrationType: "LAMBDA_FUNCTION",
      }
    );

    const vanityFlow = new connect.CfnContactFlow(this, "VanityContactFlow", {
      content: JSON.stringify(contactFlowData),
      instanceArn: vanityConnect.attrArn,
      name: "vanity-number-contact-flow",
      type: "CONTACT_FLOW",
    });
  }
}
