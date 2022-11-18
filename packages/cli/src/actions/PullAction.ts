import { ExperimentApiService } from "../services/experiment/ExperimentApiService";
import { convertToYaml, ExperimentConfigModel, sanitizeVariants } from "../config/ExperimentsConfig";
import { ExperimentFlagComparator } from "../services/experiment/ExperimentFlagComparator";
import { ComparisonResultSymbol, ICON_WARNING_W_TEXT } from "../ui/icons";
import { ComparisonResult } from "../comparison/ComparisonResult";
import { cloneDeep } from "lodash";
import { jsons } from "@amplitude/util";
import { loadLocalConfiguration } from "../config/AmplitudeConfigYamlParser";
import { BaseAction } from "./BaseAction";

export interface PullActionOptions {
  config: string;
  experimentManagementApiKey?: string;
  experimentDeploymentId?: string;
}

export class PullAction extends BaseAction {
  async run(options: PullActionOptions) {
    console.log(`Pulling latest configuration`);
    const {
      config: configPath,
      experimentManagementApiKey,
      experimentDeploymentId
    } = options;

    const {
      AMP_EXPERIMENT_MANAGEMENT_API_KEY,
      AMP_EXPERIMENT_DEPLOYMENT_ID
    } = process.env;

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
  }
}
