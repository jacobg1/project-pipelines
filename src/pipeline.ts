import { CodePipeline, CodePipelineSource, ShellStep } from "aws-cdk-lib/pipelines";
import { ProjectPipelinesStack } from "../lib/project-pipelines-stack";
import { ActionCategory, Artifact, Pipeline, PipelineType } from "aws-cdk-lib/aws-codepipeline";
import {
  CodeBuildAction,
  CodeStarConnectionsSourceAction,
} from "aws-cdk-lib/aws-codepipeline-actions";
import { BuildSpec, PipelineProject } from "aws-cdk-lib/aws-codebuild";

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
  { name, owner, branch, connectionArn }: PipelineSourceConfig,
  commands: string[]
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
    actionName: `${pipelineName}-CodeDeploy`,
    project: new PipelineProject(stack, `${pipelineName}-CodeDeployProject`, {
      buildSpec: BuildSpec.fromObject({ commands }),
    }),
    input: sourceArtifact,
    // outputs: [buildArtifact],
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
        stageName: ActionCategory.DEPLOY,
        actions: [deployAction],
      },
    ],
  });

  return pipeline;
}
