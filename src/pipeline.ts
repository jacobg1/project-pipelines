import { CodePipeline, CodePipelineSource, ShellStep } from "aws-cdk-lib/pipelines";
import { ProjectPipelinesStack } from "../lib/project-pipelines-stack";
import { ActionCategory, Artifact, Pipeline, PipelineType } from "aws-cdk-lib/aws-codepipeline";
import {
  CodeBuildAction,
  CodeStarConnectionsSourceAction,
  ManualApprovalAction,
} from "aws-cdk-lib/aws-codepipeline-actions";
import { BuildSpec, PipelineProject } from "aws-cdk-lib/aws-codebuild";
import { Role } from "aws-cdk-lib/aws-iam";

function createBuildSpec(buildCommand: string): BuildSpec {
  return BuildSpec.fromObject({
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
        commands: [buildCommand],
      },
    },
  });
}

interface SourceConfig {
  name: string;
  branch: string;
  connectionArn: string;
}

export function createCodePipeline(
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

  const codeSource = new CodeStarConnectionsSourceAction({
    actionName: `${pipelineName}-CodeSource`,
    repo: name,
    owner,
    branch,
    connectionArn,
    output: sourceArtifact,
  });

  const deployToTestAction = new CodeBuildAction({
    actionName: `${pipelineName}-CodeBuildTest`,
    project: new PipelineProject(stack, `${pipelineName}-CodeBuildProjectTest`, {
      buildSpec: createBuildSpec("npm run deploy:test"),
      role,
    }),
    input: sourceArtifact,
  });

  const deployToProdAction = new CodeBuildAction({
    actionName: `${pipelineName}-CodeBuildProd`,
    project: new PipelineProject(stack, `${pipelineName}-CodeBuildProjectProd`, {
      buildSpec: createBuildSpec("npm run deploy:legacy"),
      role,
    }),
    input: sourceArtifact,
  });

  const approvalAction = new ManualApprovalAction({
    actionName: `${pipelineName}-ManualApproval`,
  });

  const pipeline = new Pipeline(stack, pipelineName, {
    pipelineName,
    pipelineType: PipelineType.V2,
    stages: [
      {
        stageName: ActionCategory.SOURCE,
        actions: [codeSource],
      },
      {
        stageName: ActionCategory.TEST,
        actions: [deployToTestAction],
      },
      {
        stageName: ActionCategory.APPROVAL,
        actions: [approvalAction],
      },
      {
        stageName: ActionCategory.DEPLOY,
        actions: [deployToProdAction],
      },
    ],
  });

  return pipeline;
}
