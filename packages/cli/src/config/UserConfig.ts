import { UserConfigModel } from "../config";
import { JsonSchemaPropertyModel } from "../json-schema";

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
