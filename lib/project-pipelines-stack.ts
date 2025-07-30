import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";
import { getSSMParam, getSecureSSMParam, createCDKPipeline, createPipeline } from "../src";

export class ProjectPipelinesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const connectionArn = getSSMParam(this, "/project-pipeline/code-connection");
    const serverlessLoginKey = getSecureSSMParam("/serverless/login/key");

    createCDKPipeline(
      this,
      "ProjectPipelines",
      {
        name: "jacobg1/project-pipelines",
        branch: "main",
        connectionArn,
      },
      ["npm ci", "npm run build", "npx cdk synth"]
    );

    createPipeline(
      this,
      "SpaceSearchPipeline",
      {
        name: "NasaSearch",
        owner: "jacobg1",
        branch: "pipeline-test",
        connectionArn,
      },
      serverlessLoginKey
    );
  }
}
