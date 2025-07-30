import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { ProjectPipelinesStack } from "../lib/project-pipelines-stack";

export function getSSMParam(stack: ProjectPipelinesStack, name: string): string {
  const param = StringParameter.valueForStringParameter(stack, name);
  return param;
}
