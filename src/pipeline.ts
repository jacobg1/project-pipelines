import { CodePipeline, CodePipelineSource, ShellStep } from "aws-cdk-lib/pipelines";
import { ProjectPipelinesStack } from "../lib/project-pipelines-stack";
import { ActionCategory, Artifact, Pipeline, PipelineType } from "aws-cdk-lib/aws-codepipeline";
import {
  CodeBuildAction,
  CodeStarConnectionsSourceAction,
} from "aws-cdk-lib/aws-codepipeline-actions";
import { BuildSpec, PipelineProject } from "aws-cdk-lib/aws-codebuild";
import { Role } from "aws-cdk-lib/aws-iam";

interface SourceConfig {
  name: string;
  branch: string;
  connectionArn: string;
}

export function createCDKPipeline(
  stack: ProjectPipelinesStack,
  pipelineName: string,
  { name, branch, connectionArn }: SourceConfig,
  commands: string[]
): CodePipeline {
  const pipeline = new CodePipeline(stack, pipelineName, {
    pipelineName,
    synth: new ShellStep("Synth", {
      input: CodePipelineSource.connection(name, branch, {
        connectionArn,
      }),
      commands,
    }),
  });

  return pipeline;
}

interface PipelineSourceConfig extends SourceConfig {
  owner: string;
}

export function createPipeline(
  stack: ProjectPipelinesStack,
  pipelineName: string,
  role: Role,
  { name, owner, branch, connectionArn }: PipelineSourceConfig
): Pipeline {
  const sourceArtifact = new Artifact("SourceArtifact");
  // const buildArtifact = new Artifact("BuildArtifact");

  const codeSource = new CodeStarConnectionsSourceAction({
    actionName: `${pipelineName}-CodeSource`,
    repo: name,
    owner,
    branch,
    connectionArn,
    output: sourceArtifact,
  });

  const deployAction = new CodeBuildAction({
    actionName: `${pipelineName}-CodeBuild`,
    project: new PipelineProject(stack, `${pipelineName}-CodeBuildProject`, {
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        env: {
          "parameter-store": {
            SERVERLESS_ACCESS_KEY: "/serverless/login/key",
          },
        },
        phases: {
          install: {
            commands: ["npm i -g serverless@4.17.1", "npm ci"],
          },
          pre_build: {
            commands: ["serverless login"],
          },
          build: {
            commands: ["npm run deploy:test"],
          },
        },
      }),
      role,
    }),
    input: sourceArtifact,
  });

  const pipeline = new Pipeline(stack, pipelineName, {
    pipelineName,
    pipelineType: PipelineType.V2,
    stages: [
      {
        stageName: ActionCategory.SOURCE,
        actions: [codeSource],
      },
      // { stageName: ActionCategory.APPROVAL },
      {
        stageName: ActionCategory.DEPLOY,
        actions: [deployAction],
      },
    ],
  });

  return pipeline;
}
