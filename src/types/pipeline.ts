import { Pipeline } from "aws-cdk-lib/aws-codepipeline";
import { Role } from "aws-cdk-lib/aws-iam";
import { CodePipeline } from "aws-cdk-lib/pipelines";
import { ProjectPipelinesStack } from "../../lib/project-pipelines-stack";

export interface CreateCodePipelineProps {
  name: string;
  owner: string;
  branch: string;
  connectionArn: string;
  commands: { synth?: string[]; test?: string[]; prod?: string[] };
}

export interface CreatePipelineProps extends CreateCodePipelineProps {
  role: Role;
}

interface PipelineCommandsProps {
  synth?: string[];
  test?: string[];
  prod?: string[];
}

interface PipelineConfigProps {
  name: string;
  owner: string;
  branch: string;
  commands: PipelineCommandsProps;
}

type CreateFunctionReturnValue = CodePipeline | Pipeline;

type CreateFunction = (
  context: ProjectPipelinesStack,
  pipeLineName: string,
  ...props: CreatePipelineProps[]
) => CreateFunctionReturnValue;

export interface PipelineConfig {
  pipeLineName: string;
  createFunction: CreateFunction;
  props: PipelineConfigProps;
}
