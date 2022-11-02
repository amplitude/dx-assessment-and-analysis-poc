import { AnalyticsConfigModel } from "../config";
import { JsonSchemaPropertyModel } from "../json-schema";
import { cloneDeep } from "lodash";

export class AnalyticsConfig {
  constructor(private model: AnalyticsConfigModel) {}

  hasEvents(): boolean {
    return Object.keys(this.model).length > 0;
  }

  getEventNames(): string[] {
    return Object.keys(this.model);
  }

  getEventSchemas(): JsonSchemaPropertyModel[] {
    return this.getEventNames().map(name => ({
      type: 'object',
      title: name,
      additionalProperties: false,
      ...cloneDeep(this.model[name]),
    }));
  }
}
