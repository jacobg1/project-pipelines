import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";
import { getSSMParam, createPipeline } from "../src";

export class ProjectPipelinesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const connectionArn = getSSMParam(this, "/project-pipeline/code-connection");

    createPipeline(
      this,
      "ProjectPipelines",
      {
        name: "jacobg1/project-pipelines",
        branch: "main",
        connectionArn,
      },
      ["npm ci", "npm run build", "npx cdk synth"]
    );

    const spaceSearchPipeline = createPipeline(
      this,
      "SpaceSearchPipeline",
      { name: "jacobg1/NasaSearch", branch: "pipeline-test", connectionArn },
      ["npm ci"]
    );
  }
}
