import { ICON_RETURN_ARROW } from "../ui/icons";
import {
  loadLocalConfiguration,
  saveYamlToFile,
} from "../config/AmplitudeConfigYamlParser";
import { BaseAction } from "./BaseAction";
import { AnalyticsPullAction } from "./AnalyticsPullAction";
import { ExperimentPullAction } from "./ExperimentPullAction";

export interface PullActionOptions {
  config: string;
  experimentManagementApiKey?: string;
  experimentDeploymentKey?: string;
  dataApiToken?: string;
}

export class PullAction extends BaseAction {
  async run(options: PullActionOptions) {
    this.logger().info(`Pulling latest configuration`);
    const {
      config: configPath,
      experimentManagementApiKey = process.env.AMP_EXPERIMENT_MANAGEMENT_API_KEY,
      experimentDeploymentKey = process.env.AMP_EXPERIMENT_DEPLOYMENT_KEY,
      dataApiToken = process.env.AMP_DATA_API_TOKEN,
    } = options;

    try {
      const config = loadLocalConfiguration(configPath);

      await new AnalyticsPullAction().run({ config, dataApiToken });
      await new ExperimentPullAction().run({
        config,
        experimentManagementApiKey,
        experimentDeploymentKey
      });

      saveYamlToFile(configPath, config);
      this.logger().success(`Configuration saved successfully.`)
        .log(`  ${ICON_RETURN_ARROW} ${configPath}`);
    } catch (err) {
      this.logger().error(`Unhandled exception ${err}`);
      return;
    }
  }
}
