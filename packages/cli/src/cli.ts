import { program } from 'commander';
import * as fs from "fs";
import * as path from "path";
import * as dotenv from 'dotenv';

import { TypeScriptExporter } from "./generators/generators";
import { CodeGenerator } from "./generators/code-generator";
import { AmplitudeBrowserCodeGenerator, AmplitudeNodeCodeGenerator } from "./generators/typescript/amplitude-generator";
import { AmplitudeConfig } from "./config/AmplitudeConfig";
import { isValid, parseFromYaml, parseFromYamlAndBack } from "./config/AmplitudeConfigYamlParser";
import { ExperimentApiService } from "./services/experiment/ExperimentApiService";
import { ExperimentFlagModel } from "./services/experiment/models";
import { ComparisonResultSymbol, ICON_WARNING_W_TEXT } from "./ui/icons";
import { ComparisonResult } from "./comparison/ComparisonResult";
import { cloneDeep, omit } from "lodash";
import { ExperimentFlagComparator } from "./services/experiment/ExperimentFlagComparator";
import { jsons } from "@amplitude/util";
import { convertToYaml, ExperimentConfigModel, sanitizeVariants } from "./config/ExperimentsConfig";
import { omitDeep } from "./util/omitDeep";


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

  console.log(parseFromYamlAndBack(ymlConfig));

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
      const flagsFromServer = await experimentApiService.loadFlagsList2(deploymentId);

      // console.log(jsons(flagsFromServer));

      console.log(`Received ${flagsFromServer.length} flags from server.`);

      const flagsFromLocal = config.experiment().getFlags();
      console.log(`Found ${flagsFromLocal.length} local flags.`);

      const mergedFlags: ExperimentConfigModel[] = [];
      const comparator = new ExperimentFlagComparator();

      // check for changes in flags on both
      for (const serverFlag of flagsFromServer) {
        const localFlag = flagsFromLocal.find(f => f.key === serverFlag.key);
        if (!localFlag) {
          console.log(`${ComparisonResultSymbol[ComparisonResult.Added]} ${serverFlag.key}`);
          mergedFlags.push(serverFlag)
        } else {
          const comparison = comparator.compare2(localFlag, serverFlag)
          console.log(`${ComparisonResultSymbol[comparison.result]} ${serverFlag.key}`);

          const mergedFlag = cloneDeep(localFlag);
          mergedFlags.push(mergedFlag);
          if (comparison.result !== ComparisonResult.NoChanges) {
            console.warn(`${ICON_WARNING_W_TEXT} Server changes will take precedence.`);

            // copy server changes but keep payload schema from local
            mergedFlag.key = serverFlag.key;
            mergedFlag.description = serverFlag.description;
            mergedFlag.variants = sanitizeVariants(serverFlag.variants);
          }
        }
      }

      // Check for local flags that no longer exist on server
      for (const localFlag of flagsFromLocal) {
        const serverFlag = flagsFromServer.find(f => f.key === localFlag.key);
        if (!serverFlag) {
          console.log(`${ComparisonResultSymbol[ComparisonResult.Removed]} ${localFlag.key}`);
        }
      }

      console.log(`Flags ${jsons(mergedFlags)}`);

      const yaml = mergedFlags.map(f => convertToYaml(f)).join(`\n`);
      console.log(yaml);



    } catch (err) {
      console.log(`Unhandled exception ${err}`);
      return;
    }
  });

program.parse();
