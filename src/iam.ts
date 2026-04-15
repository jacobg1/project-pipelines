import {
  Effect,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { ProjectPipelinesStack } from "../lib/project-pipelines-stack";

function createArn(service: string, name: string) {
  const regionAndAccount = `${process.env.CDK_DEFAULT_REGION}:${process.env.CDK_DEFAULT_ACCOUNT}`;
  return `arn:aws:${service}:${regionAndAccount}:${name}`;
}

function addPermissions(role: Role): Role {
  role.addToPolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      resources: [
        createArn("ssm", "parameter/serverless-framework/deployment/s3-bucket"),
        createArn("ssm", "parameter/serverless/login/key"),
        createArn("ssm", "parameter/nasa-search/api-url"),
        createArn("ssm", "parameter/nasa-search/website-url"),
        createArn("ssm", "parameter/space-search-*/obj-key"),
        createArn("ssm", "parameter/concert-search/api-url"),
        createArn("ssm", "parameter/concert-search/metadata-url"),
        createArn("ssm", "parameter/concert-search/advanced-search-url"),
      ],
      actions: ["ssm:GetParameters", "ssm:GetParameter"],
    }),
  );

  role.addToPolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      resources: ["*"],
      actions: [
        "cloudformation:CreateChangeSet",
        "cloudformation:DeleteChangeSet",
        "cloudformation:DescribeChangeSet",
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DescribeStackResource",
        "cloudformation:ExecuteChangeSet",
        "cloudformation:CreateStack",
        "cloudformation:UpdateStack",
        "cloudformation:RollbackStack",
        "cloudformation:ContinueUpdateRollback",
        "cloudformation:ValidateTemplate",
        "cloudformation:ListStackResources",
      ],
    }),
  );

  role.addToPolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      resources: ["*"],
      actions: [
        "cloudformation:CreateStackRefactor",
        "cloudformation:DescribeStackRefactor",
        "cloudformation:ExecuteStackRefactor",
        "cloudformation:ListStackRefactorActions",
        "cloudformation:ListStackRefactors",
        "cloudformation:ListStacks",
        "cloudformation:GetTemplate",
      ],
    }),
  );

  role.addToPolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      resources: [
        "arn:aws:s3:::serverless-framework-deployments-*",
        "arn:aws:s3:::concert-search-*",
        "arn:aws:s3:::nasa-search-*",
        "arn:aws:s3:::space-search-*",
      ],
      actions: [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:CreateBucket",
        "s3:GetObjectVersion",
        "s3:GetBucketVersioning",
        "s3:PutBucketVersioning",
        "s3:GetBucketLocation",
        "s3:PutBucketTagging",
        "s3:PutEncryptionConfiguration",
        "s3:PutBucketPolicy",
      ],
    }),
  );

  role.addToPolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      resources: ["arn:aws:iam::*"],
      actions: [
        "iam:GetRole",
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:PassRole",
        "iam:DeleteRolePolicy",
        "iam:TagRole",
        "iam:PutRolePolicy",
        "iam:DeleteRole",
      ],
    }),
  );

  role.addToPolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      resources: ["arn:aws:lambda:*"],
      actions: [
        "lambda:GetFunctionConfiguration",
        "lambda:PublishVersion",
        "lambda:ListVersionsByFunction",
        "lambda:CreateFunction",
        "lambda:update*",
        "lambda:ListFunctions",
        "lambda:GetFunction",
        "lambda:DeleteFunction",
        "lambda:TagResource",
        "lambda:AddPermission",
        "lambda:RemovePermission",
      ],
    }),
  );

  role.addToPolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      resources: ["arn:aws:logs:*"],
      actions: [
        "logs:DeleteLogGroup",
        "logs:CreateLogGroup",
        "logs:TagResource",
      ],
    }),
  );

  role.addToPolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      resources: [
        "arn:aws:apigateway:*::/restapis*",
        "arn:aws:apigateway:*::/tags*",
        "arn:aws:apigateway:*::/apis*",
      ],
      actions: [
        "apigateway:GET",
        "apigateway:PUT",
        "apigateway:PATCH",
        "apigateway:POST",
        "apigateway:DELETE",
        "apigateway:TagResource",
      ],
    }),
  );

  return role;
}

function createRole(stack: ProjectPipelinesStack, name: string): Role {
  const buildRole = new Role(stack, name, {
    roleName: `${name}Name`,
    assumedBy: new ServicePrincipal("codebuild.amazonaws.com"),
  });
  return buildRole;
}

export function createBuildRole(
  stack: ProjectPipelinesStack,
  name: string,
): Role {
  const buildRole = createRole(stack, name);
  return addPermissions(buildRole);
}
