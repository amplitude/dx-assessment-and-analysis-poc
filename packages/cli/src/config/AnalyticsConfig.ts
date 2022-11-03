import { JsonSchemaPropertyModel } from "../json-schema";
import { cloneDeep } from "lodash";
import { PropertyConfigModel } from "./PropertyConfigModel";

export interface EventConfigModel {
  description?: string;
  properties?: Record<string, PropertyConfigModel>;
  required?: string[];
}

export interface AnalyticsConfigModel {
  [eventName: string]: EventConfigModel;
}

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
