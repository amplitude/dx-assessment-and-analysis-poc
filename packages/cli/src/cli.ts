import { program } from 'commander';
import * as fs from "fs";
import * as path from "path";
import * as dotenv from 'dotenv';

import { TypeScriptExporter } from "./generators/generators";
import { CodeGenerator } from "./generators/code-generator";
import {
  AmplitudeBrowserCodeGenerator,
  AmplitudeNodeCodeGenerator
} from "./generators/typescript/amplitude-generator";
import { AmplitudeConfig } from "./config/AmplitudeConfig";
import { isValid, parseFromYaml } from "./config/AmplitudeConfigYamlParser";
import { ExperimentApiService } from "./services/experiment/ExperimentApiService";
import { jsons } from "@amplitude/util";

// Load local '.env'
dotenv.config();

const {
  AMP_EXPERIMENT_MANAGEMENT_API_KEY,
  AMP_EXPERIMENT_DEPLOYMENT_ID
} = process.env;

function loadLocalConfiguration(configPath: string): AmplitudeConfig {
  console.log(`Config Path:`, configPath);

  const ymlConfig = fs.readFileSync(path.resolve(configPath), 'utf8');

  const configModel = parseFromYaml(ymlConfig);
  const configValidation = isValid(configModel);
  if (!configValidation.valid) {
    throw new Error(`Error loading configuration from ${configPath}. ${configValidation.errors}`);
  }

  return new AmplitudeConfig(configModel);
}

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
  .action(async (options) => {
    const { config: configPath } = options;

    try {
      const config = loadLocalConfiguration(configPath);
      const { platform, output: outputPath, outputFileName }  = config.codegen().model;

      let generator: CodeGenerator;
      switch (platform) {
        case 'Browser':
          generator = new AmplitudeBrowserCodeGenerator(config);
          break;
        case 'Node':
          generator = new AmplitudeNodeCodeGenerator(config);
          break;
        default:
          console.error(`Unsupported 'platform' ${platform}.`);
          return;
      }

      let exporter = new TypeScriptExporter();
      const outputFiles = await exporter.export(await generator.generate());
      outputFiles.forEach(file => {
        let fileName = file.path;
        if (outputFileName && fileName.startsWith('index')) {
          fileName = fileName.replace('index', outputFileName)
          console.log(`Renamed '${file.path}' to '${fileName}' based on 'settings.outputFileName'.`)
        }

        fs.writeFileSync(path.join(outputPath, fileName), file.code);
      });
    } catch (e) {
      console.log(`Error reading configuration from ${configPath}`, e);
      return;
    }
  });

program.command('pull')
  .description('Update the local configuration YML to the latest from the server')
  .option(
    '--config [configPath]',
    "Amplitude configuration file",
    "amplitude.yml",
  )
  .option(
    '--experimentManagementApiKey [experimentServerApiKey]',
    "Experiment Management API key",
  )
  .option(
    '--experimentDeploymentId [experimentDeploymentId]',
    "Experiment deployment id to use for code generation.",
  )
  .action(async (options) => {
    console.log(`Pulling latest configuration`);
    const {
      config: configPath,
      experimentManagementApiKey,
      experimentDeploymentId
    } = options;

    try {
      const config = loadLocalConfiguration(configPath);

      const experimentToken = experimentManagementApiKey ?? AMP_EXPERIMENT_MANAGEMENT_API_KEY;
      console.log(`Experiment Management API key: ${experimentToken}`);
      if (!experimentToken) {
        console.error(`Error: 'experimentManagementApiKey' is required.`);
        return;
      }

      const deploymentId = experimentDeploymentId ?? AMP_EXPERIMENT_DEPLOYMENT_ID;
      if (!deploymentId) {
        console.error(`Error: 'experimentDeploymentId' is required.`);
        return;
      }
      console.log(`Experiment Deployment Id: ${deploymentId}`);

      const experimentApiService = new ExperimentApiService(experimentToken);
      const flags = await experimentApiService.loadFlagsList(deploymentId);

      console.log(`Received ${flags.length} flags.`);

      console.log(jsons(flags)); // eslint-disable-line no-console


    } catch (err) {
      console.log(`Unhandled exception ${err}`);
      return;
    }
  });

program.parse();
