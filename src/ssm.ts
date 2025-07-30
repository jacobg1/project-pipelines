import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { ProjectPipelinesStack } from "../lib/project-pipelines-stack";
import { SecretValue } from "aws-cdk-lib";

export function getSSMParam(stack: ProjectPipelinesStack, name: string): string {
  const param = StringParameter.valueForStringParameter(stack, name);
  return param;
}

export function getSecureSSMParam(name: string): SecretValue {
  const param = SecretValue.ssmSecure(name);
  return param;
}
