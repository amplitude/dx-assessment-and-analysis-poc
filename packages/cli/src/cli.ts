import { program } from 'commander';
import * as dotenv from 'dotenv';

import { PullAction } from "./actions/PullAction";
import { BuildAction } from "./actions/BuildAction";

// Load local '.env'
dotenv.config();

program.name('Amplitude CLI')
  .description('Generates strongly typed SDKs based on configuration')
  .version('0.0.0');

program.command('build')
  .description('Build typed Amplitude SDK from local configuration')
  .option(
    '--config [configPath]',
    "Amplitude configuration file",
    "amplitude.yml",
  )
  .action(async (options) => new BuildAction().run(options));

program.command('pull')
  .description('Update the local configuration YML to the latest from the server')
  .option(
    '--config [configPath]',
    "Amplitude configuration file",
    "amplitude.yml",
  )
  .option(
    '--experimentManagementApiKey [api_key]',
    "Experiment Management API key",
  )
  .option(
    '--experimentDeploymentLabel [label]',
    "Experiment deployment label to use for code generation.",
  )
  .option(
    '--experimentDeploymentId [id]',
    "Experiment deployment id to use for code generation. Will override label.",
  )
  .action(async (options) => new PullAction().run(options));

program.parse();
