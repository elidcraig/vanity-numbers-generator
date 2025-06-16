# Assessment Project - Vanity Number Generator

To run the program and deploy resources, first fork the repo to local directory. Configure the AWS CLI, signing in on the desired IAM account.

- Amazon Connect is not available in all AWS Regions. You will need to check that your CLI is set to an available region (list found here: [link](https://docs.aws.amazon.com/connect/latest/adminguide/regions.html#amazonconnect_region) ).

From the CLI:

- Run `npm install` to download dependencies.
- Run `npm run build` to compile Typescript files.
- Run `npx cdk synth` to generate a CloudFormation template from code.
- Run `npx cdk deploy` to deploy stack.

## Project goals

1. Create a Lambda that converts phone numbers to vanity numbers and save the best 5 resulting vanity numbers and the caller's number in a DynamoDB table.

2. Create an Amazon Connect contact flow that looks at the caller's phone number and says the 3 vanity possibilities that come back from the Lambda function.

## Implementation

- I used the AWS CDK to write my infrastructure code in Typescript. This allowed me to utilize CDK's Constructs to describe the resources needed for the application stack, and easily create associations between them, while using a familiar programming language.

### Challenges

The main challenges I anticipated were learning the CDK framework, deploying an Amazon Connect instance (with contact flow) from an IaC context, and implementing the logic to generate and rank vanity numbers.

I started by reading the documentation and tutorials on the AWS website, and I found that CDK was less challenging to begin building than I had anticipated. I quickly understood the process of declaring and deploying Lambda functions and DynamoDB tables.

I found it less easy to find information in the documentation for Amazon Connect. Due to this, I began the project by building out the other necessary resources and associating them with a Connect instance which I deployed from the AWS console. When I was happy with the other elements, I returned to the Connect documentation, and after a lot of searching found the Level 1 constructs for Connect resources. I was then able to add the needed code to deploy all resources from the command line.

To implement the vanity number logic, I returned to some algorithm practice I had done in the past, and found a solution for generating all possible letter combinations from a phone number. I then wrote a function to score and sort the combinations, giving higher scores to longer words.

### Incomplete solutions / things to add

- The output of the best vanity options could be formatted better to make the prompt audio more understandable (example: "1555FLOWER1" may not be as clearly read as "1-555-FLOWER-1").

- The test suites could be more comprehensive to ensure that future development doesn't cause feature breaks.

- The project could use more robust error handling and authorization checks to combat malicious input.
