import * as cdk from "aws-cdk-lib";
import * as ssm from "aws-cdk-lib/aws-ssm";

import { CodePipeline, CodePipelineSource, ShellStep } from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";

export class ProjectPipelinesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const codeConnectionArn = ssm.StringParameter.valueForStringParameter(
      this,
      "/project-pipeline/code-connection"
    );

    console.log("ENV", process.env.CDK_DEFAULT_ACCOUNT);
    console.log("ENV", process.env.CDK_DEFAULT_REGION);

    new CodePipeline(this, "ProjectPipelines", {
      pipelineName: "ProjectPipelines",
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.connection("jacobg1/project-pipelines", "main", {
          connectionArn: codeConnectionArn,
        }),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });
  }
}
