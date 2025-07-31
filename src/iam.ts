import { ProjectPipelinesStack } from "../lib/project-pipelines-stack";
import { Effect, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

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
      ],
      actions: ["ssm:GetParameters", "ssm:GetParameter"],
    })
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
    })
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
      ],
    })
  );

  role.addToPolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      resources: ["arn:aws:s3:::serverless-framework-deployments-*"],
      actions: [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:CreateBucket",
        "s3:GetObjectVersion",
        "s3:GetBucketVersioning",
        "s3:PutBucketVersioning",
        "s3:GetBucketLocation",
      ],
    })
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
    })
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
    })
  );

  role.addToPolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      resources: ["arn:aws:logs:*"],
      actions: ["logs:DeleteLogGroup", "logs:CreateLogGroup", "logs:TagResource"],
    })
  );

  role.addToPolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      resources: [
        "arn:aws:apigateway:*::/restapis*",
        "arn:aws:apigateway:*::/tags*",
        "arn:aws:apigateway:*::/apis*",
      ],
      actions: ["apigateway:GET", "apigateway:PUT", "apigateway:POST", "apigateway:DELETE"],
    })
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

export function createBuildRole(stack: ProjectPipelinesStack, name: string): Role {
  const buildRole = createRole(stack, name);
  return addPermissions(buildRole);
}
