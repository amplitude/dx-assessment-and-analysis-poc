import { JsonSchemaPropertyModel } from "../json-schema";
import { PropertyConfigModel } from "./PropertyConfigModel";

export interface UserConfigModel {
  properties?: Record<string, PropertyConfigModel>;
  required?: string[];
}

export class UserConfig {
  constructor(private model: UserConfigModel) {}

  getUserSchema(): JsonSchemaPropertyModel {
    return {
      type: 'object',
      title: 'User Properties',
      additionalProperties: false,
      ...this.model
    };
  }
}
