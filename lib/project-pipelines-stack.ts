import * as cdk from "aws-cdk-lib";
import { CodePipeline, CodePipelineSource, ShellStep } from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";

export class ProjectPipelinesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, "ProjectPipelines", {
      pipelineName: "ProjectPipelines",
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.connection("jacobg1/project-pipelines", "main", {
          connectionArn: process.env.CDK_CODEBUILD_CONNECTION_ARN as string,
        }),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });
  }
}
