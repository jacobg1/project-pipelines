import { CodePipeline, CodePipelineSource, ShellStep } from "aws-cdk-lib/pipelines";
import { ProjectPipelinesStack } from "../lib/project-pipelines-stack";

interface SourceConfig {
  name: string;
  branch: string;
  connectionArn: string;
}

export function createPipeline(
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
