import { Pipeline } from "aws-cdk-lib/aws-codepipeline";
import { Role } from "aws-cdk-lib/aws-iam";
import { CodePipeline } from "aws-cdk-lib/pipelines";
import { ProjectPipelinesStack } from "../../lib/project-pipelines-stack";

interface PipelineCommandsProps {
  synth?: string[];
  install?: string[];
  test?: string[];
  prod?: string[];
}

export interface CreateCodePipelineProps {
  name: string;
  owner: string;
  branch: string;
  connectionArn: string;
  commands: PipelineCommandsProps;
}

export interface CreatePipelineProps extends CreateCodePipelineProps {
  role: Role;
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
