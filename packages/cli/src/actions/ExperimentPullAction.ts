import { ExperimentApiService } from "../services/experiment/ExperimentApiService";
import { convertToFlagConfigModel, FlagConfigModel } from "../config/ExperimentsConfig";
import { ExperimentFlagComparator } from "../comparison/ExperimentFlagComparator";
import {
  ComparisonResultSymbol,
  ICON_ARROW,
  ICON_RETURN_ARROW,
} from "../ui/icons";
import { ComparisonResult } from "../comparison/ComparisonResult";
import { cloneDeep, isEmpty } from "lodash";
import { BaseAction } from "./BaseAction";
import { AmplitudeConfig } from "../config/AmplitudeConfig";

export interface ExperimentPullActionOptions {
  config: AmplitudeConfig;
  experimentManagementApiKey?: string;
  experimentDeploymentKey?: string;
}

export class ExperimentPullAction extends BaseAction {
  async run(options: ExperimentPullActionOptions) {
    this.logger().info(`Pulling Experiment configuration`);

    const {
      config,
      experimentManagementApiKey = process.env.AMP_EXPERIMENT_MANAGEMENT_API_KEY,
      experimentDeploymentKey = process.env.AMP_EXPERIMENT_DEPLOYMENT_KEY,
    } = options;

    try {
      // Check input params
      if (!experimentManagementApiKey) {
        this.logger().error(`'experimentManagementApiKey' is required.`);
        return;
      }
      if (isEmpty(experimentDeploymentKey)) {
        this.logger().error(`'experimentDeploymentKey' is required.`);
        return;
      }

      // Create Experiment API
      const experimentApiService = new ExperimentApiService(experimentManagementApiKey);

      // Locate deployment by key
      const deployments = await experimentApiService.getDeployments();
      const deploymentId = deployments.find(d => d.key === experimentDeploymentKey)?.id;
      if (isEmpty(deploymentId)) {
        console.error(deployments);
        this.logger().error(`Unable to locate deployment for given key.`);
        return;
      }

      // get flags from local amplitude.yml
      const flagsFromLocal = config.experiment().getFlags();
      // load flags from server
      const flagsFromServer = (await experimentApiService.getFlags(deploymentId)).map(
        flag => convertToFlagConfigModel(flag),
      );
      this.logger().log(`  ${ICON_RETURN_ARROW} Flags: ${flagsFromLocal.length} (local) ${ICON_ARROW} ${flagsFromServer.length} (server)`);

      const mergedFlags: FlagConfigModel[] = [];
      const comparator = new ExperimentFlagComparator();

      // check for changes in flags on both
      let hasChanges = false;
      for (const serverFlag of flagsFromServer) {
        const localFlag = flagsFromLocal.find(f => f.key === serverFlag.key);
        if (!localFlag) {
          this.logger().log(`${ComparisonResultSymbol[ComparisonResult.Added]} ${serverFlag.key}`);
          mergedFlags.push(serverFlag)
        } else {
          const comparison = comparator.compare(localFlag, serverFlag)
          this.logger().log(`${ComparisonResultSymbol[comparison.result]} ${serverFlag.key}`);
          const { changes } = comparison;
          const changedFields = Object.keys(changes);
          changedFields.forEach(field => {
            this.logger().log(`    ${ICON_RETURN_ARROW} ${field}: ${changes[field].origin} -> ${changes[field].target}`);
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
          this.logger().log(`${ComparisonResultSymbol[ComparisonResult.Removed]} ${localFlag.key}`);
        }
      }

      if (hasChanges) {
        this.logger().warn(`Server changes will overwrite local values.`);
        // Update config with updated flags
        config.experiment().setFlags(mergedFlags);
      } else {
        this.logger().success(`Local Experiment configuration is already up to date.`);
      }
    } catch (err) {
      this.logger().error(`Unhandled exception pulling Experiment data. ${err}`);
      return;
    }
  }
}
