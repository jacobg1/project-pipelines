import { CodePipeline, CodePipelineSource, ShellStep } from "aws-cdk-lib/pipelines";
import { ProjectPipelinesStack } from "../lib/project-pipelines-stack";
import { ActionCategory, Artifact, Pipeline, PipelineType } from "aws-cdk-lib/aws-codepipeline";
import {
  CodeBuildAction,
  CodeStarConnectionsSourceAction,
  ManualApprovalAction,
} from "aws-cdk-lib/aws-codepipeline-actions";
import { BuildSpec, PipelineProject } from "aws-cdk-lib/aws-codebuild";
import { CreateCodePipelineProps, CreatePipelineProps } from "./types";

function createBuildSpec(buildCommand: string[], installCommand: string[]): BuildSpec {
  return BuildSpec.fromObject({
    version: "0.2",
    env: {
      variables: {
        TURBO_TELEMETRY_DISABLED: 1,
      },
      "parameter-store": {
        SERVERLESS_ACCESS_KEY: "/serverless/login/key",
        API_BASE_URL: "/concert-search/api-url",
      },
    },
    phases: {
      install: {
        "runtime-versions": {
          nodejs: "22.x",
        },
        commands: installCommand,
      },
      pre_build: {
        commands: ["serverless login"],
      },
      build: {
        commands: buildCommand,
      },
    },
  });
}

export function createCodePipeline(
  stack: ProjectPipelinesStack,
  pipelineName: string,
  { name, owner, branch, connectionArn, commands: { synth } }: CreateCodePipelineProps
): CodePipeline {
  if (!synth?.length) {
    throw new Error("Missing synth command");
  }

  const pipeline = new CodePipeline(stack, pipelineName, {
    pipelineName,
    synth: new ShellStep("Synth", {
      input: CodePipelineSource.connection(`${owner}/${name}`, branch, {
        connectionArn,
      }),
      commands: synth,
    }),
  });

  return pipeline;
}

export function createPipeline(
  stack: ProjectPipelinesStack,
  pipelineName: string,
  {
    name,
    owner,
    branch,
    role,
    connectionArn,
    commands: { install, test, prod },
  }: CreatePipelineProps
): Pipeline {
  if (!test?.length) {
    throw new Error("Missing test command");
  }

  if (!prod?.length) {
    throw new Error("Missing prod command");
  }

  if (!install?.length) {
    throw new Error("Missing install command");
  }

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
      buildSpec: createBuildSpec(test, install),
      role,
    }),
    input: sourceArtifact,
  });

  const deployToProdAction = new CodeBuildAction({
    actionName: `${pipelineName}-CodeBuildProd`,
    project: new PipelineProject(stack, `${pipelineName}-CodeBuildProjectProd`, {
      buildSpec: createBuildSpec(prod, install),
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
