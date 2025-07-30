import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";
import { getSSMParam, createCodePipeline, createPipeline } from "../src";
import { createBuildRole } from "../src/iam";

export class ProjectPipelinesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const connectionArn = getSSMParam(this, "/project-pipeline/code-connection");
    const role = createBuildRole(this, "ProjectPipelinesRole");

    createCodePipeline(
      this,
      "ProjectPipelines",
      {
        name: "jacobg1/project-pipelines",
        branch: "main",
        connectionArn,
      },
      ["npm ci", "npm run build", "npx cdk synth"]
    );

    createPipeline(this, "SpaceSearchPipeline", role, {
      name: "NasaSearch",
      owner: "jacobg1",
      branch: "main",
      connectionArn,
    });
  }
}
