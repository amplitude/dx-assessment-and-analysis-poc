import { ExperimentApiService } from "../services/experiment/ExperimentApiService";
import { convertToFlagConfigModel, FlagConfigModel } from "../config/ExperimentsConfig";
import { ExperimentFlagComparator } from "../services/experiment/ExperimentFlagComparator";
import { ComparisonResultSymbol, ICON_RETURN_ARROW, ICON_SUCCESS, ICON_WARNING_W_TEXT } from "../ui/icons";
import { ComparisonResult } from "../comparison/ComparisonResult";
import { cloneDeep } from "lodash";
import { loadLocalConfiguration, saveYamlToFile } from "../config/AmplitudeConfigYamlParser";
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
      // console.log(`Experiment Management API key: ${experimentToken}`);
      if (!experimentToken) {
        console.error(`Error: 'experimentManagementApiKey' is required.`);
        return;
      }

      const deploymentId = experimentDeploymentId ?? AMP_EXPERIMENT_DEPLOYMENT_ID;
      if (!deploymentId) {
        console.error(`Error: 'experimentDeploymentId' is required.`);
        return;
      }
      // console.log(`Experiment Deployment Id: ${deploymentId}`);

      // get flags from local amplitude.yml
      const flagsFromLocal = config.experiment().getFlags();
      console.log(`Found ${flagsFromLocal.length} local flags.`);

      // load flags from server
      const experimentApiService = new ExperimentApiService(experimentToken);
      const flagsFromServer = (await experimentApiService.getFlagsList(deploymentId)).map(
        flag => convertToFlagConfigModel(flag),
      );
      console.log(`Received ${flagsFromServer.length} flags from server.`);

      const mergedFlags: FlagConfigModel[] = [];
      const comparator = new ExperimentFlagComparator();

      // check for changes in flags on both
      let hasChanges = false;
      for (const serverFlag of flagsFromServer) {
        const localFlag = flagsFromLocal.find(f => f.key === serverFlag.key);
        if (!localFlag) {
          console.log(`${ComparisonResultSymbol[ComparisonResult.Added]} ${serverFlag.key}`);
          mergedFlags.push(serverFlag)
        } else {
          const comparison = comparator.compare(localFlag, serverFlag)
          console.log(`${ComparisonResultSymbol[comparison.result]} ${serverFlag.key}`);
          const { changes } = comparison;
          const changedFields = Object.keys(changes);
          changedFields.forEach(field => {
            console.log(`    ${ICON_RETURN_ARROW} ${field}: ${changes[field].origin} -> ${changes[field].target}`);
          })

          const mergedFlag = cloneDeep(localFlag);
          mergedFlags.push(mergedFlag);
          if (comparison.result !== ComparisonResult.NoChanges) {
            hasChanges = true;

            // copy server changes but keep payload schema from local
            mergedFlag.key = serverFlag.key;
            mergedFlag.description = serverFlag.description;
            mergedFlag.variants = serverFlag.variants;
          }
        }
      }

      // Check for local flags that no longer exist on server
      for (const localFlag of flagsFromLocal) {
        const serverFlag = flagsFromServer.find(f => f.key === localFlag.key);
        if (!serverFlag) {
          hasChanges = true;
          console.log(`${ComparisonResultSymbol[ComparisonResult.Removed]} ${localFlag.key}`);
        }
      }

      if (hasChanges) {
        console.warn(`${ICON_WARNING_W_TEXT} Server changes will overwrite local values.`);
        // Update config with updated flags & save to file
        config.experiment().setFlags(mergedFlags);
        saveYamlToFile(configPath, config);
        console.log(`${ICON_SUCCESS} Configuration saved successfully.`);
        console.log(`  ${ICON_RETURN_ARROW} ${configPath}`);
      } else {
        console.log(`${ICON_SUCCESS} Local configuration is already up to date.`);
      }
    } catch (err) {
      console.log(`Unhandled exception ${err}`);
      return;
    }
  }
}
