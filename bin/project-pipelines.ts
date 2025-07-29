#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ProjectPipelinesStack } from "../lib/project-pipelines-stack";

const app = new cdk.App();
new ProjectPipelinesStack(app, "ProjectPipelinesStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

app.synth();
