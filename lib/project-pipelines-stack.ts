import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";
import { getSSMParam, createCodePipeline, createPipeline } from "../src";
import { createBuildRole, type PipelineConfig } from "../src";

const pipelines: PipelineConfig[] = [
  {
    pipeLineName: "ProjectPipelines",
    createFunction: createCodePipeline,
    props: {
      name: "project-pipelines",
      owner: "jacobg1",
      branch: "main",
      commands: { synth: ["npm ci", "npm run build", "npx cdk synth"] },
    },
  },
  {
    pipeLineName: "SpaceSearchPipeline",
    createFunction: createPipeline,
    props: {
      name: "NasaSearch",
      owner: "jacobg1",
      branch: "main",
      commands: {
        install: ["npm i -g serverless@4.17.1", "npm ci"],
        test: ["npm run deploy:test"],
        prod: ["npm run deploy"],
      },
    },
  },
  {
    pipeLineName: "ConcertSearchPipeline",
    createFunction: createPipeline,
    props: {
      name: "concert-search-2.0",
      owner: "jacobg1",
      branch: "main",
      commands: {
        install: ["npm i -g serverless@4.17.1 @nestjs/cli@11.0.10 turbo@2.5.5", "npm ci"],
        test: ["npm run deploy:test"],
        prod: ["npm run deploy"],
      },
    },
  },
];

export class ProjectPipelinesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const connectionArn = getSSMParam(this, "/project-pipeline/code-connection");
    const role = createBuildRole(this, "ProjectPipelinesRole");

    pipelines.forEach(({ pipeLineName, createFunction, props }) => {
      createFunction(this, pipeLineName, { ...props, role, connectionArn });
    });
  }
}
