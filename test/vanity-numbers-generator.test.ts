import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as VanityNumbersGenerator from "../lib/vanity-numbers-generator-stack";

test("Resources created", () => {
  const app = new cdk.App();

  const stack = new VanityNumbersGenerator.VanityNumbersGeneratorStack(
    app,
    "MyTestStack"
  );

  const template = Template.fromStack(stack);

  template.hasResource("AWS::DynamoDB::Table", {});
  template.hasResource("AWS::Lambda::Function", {});
  template.hasResource("AWS::Connect::Instance", {});
  template.hasResource("AWS::Connect::ContactFlow", {});
  template.hasResource("AWS::Connect::IntegrationAssociation", {});
});
