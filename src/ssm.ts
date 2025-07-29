import * as ssm from "aws-cdk-lib/aws-ssm";
import { ProjectPipelinesStack } from "../lib/project-pipelines-stack";

export function getSSMParam(stack: ProjectPipelinesStack, name: string): string {
  const codeConnectionArn = ssm.StringParameter.valueForStringParameter(stack, name);
  return codeConnectionArn;
}
