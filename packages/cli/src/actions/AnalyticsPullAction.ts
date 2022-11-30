import { ComparisonResultSymbol } from "../ui/icons";
import { ComparisonResult } from "../comparison/ComparisonResult";
import { isEmpty } from "lodash";
import { BaseAction } from "./BaseAction";
import { convertToEventSchema, DataApiService } from "../services/data/DataApiService";
import { AmplitudeConfig } from "../config/AmplitudeConfig";

export interface AnalyticsPullActionOptions {
  config: AmplitudeConfig;
  dataApiToken?: string;
}

export class AnalyticsPullAction extends BaseAction {
  async run(options: AnalyticsPullActionOptions) {
    this.logger().info(`Pulling Analytics configuration`);
    const {
      config,
      dataApiToken = process.env.AMP_DATA_API_TOKEN,
    } = options;

    try {
      if (isEmpty(dataApiToken)) {
        this.logger().error(`'dataApiToken' is required`);
      }

      const dataApiService = new DataApiService(dataApiToken);
      const {
        AMP_ORG_ID: orgId,
        AMP_WORKSPACE_ID: workspaceId,
        AMP_BRANCH_ID: branchId,
        AMP_VERSION_ID: versionId,
        AMP_SOURCE_ID: sourceId,
      } = process.env;

      const dataEvents = await dataApiService.getEvents(orgId, workspaceId, branchId, versionId, sourceId);
      dataEvents.forEach(event => {
        console.log(`${ComparisonResultSymbol[ComparisonResult.NoChanges]} ${event.name}`)
      });

      const eventSchemas = dataEvents
        .filter(event => !event.isDeleted)
        .map(event => convertToEventSchema(workspaceId, event));

      config.analytics().setEvents(eventSchemas);

      this.logger().success(`Loaded ${dataEvents.length} Analytics events from server.`);
    } catch (err) {
      this.logger().error(`Unhandled exception pulling Analytics data. ${err}`);
      return;
    }
  }
}
