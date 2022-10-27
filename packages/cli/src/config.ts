import { parse } from 'yaml';
import { JsonSchemaPropertyModel } from "./json-schema";

export type Product = 'experiment' | 'analytics';

export type Platform = 'Node' | 'Browser';

export const allPlatforms: Set<Platform> = new Set<Platform>(['Node', 'Browser']);

export type Language = 'TypeScript';

export interface CodeGenerationSettingsModel {
  platform: Platform;
  // language: string;
  // sdk: string;
  output: string;
  outputFileName?: string;
  typedAnchorName?: string;
}

export class CodeGenerationSettings {
  constructor(public model: CodeGenerationSettingsModel) {}

  getTypedAnchorName(): string {
    return this.model.typedAnchorName || "typed";
  }
}

export interface ProductEnvironment {
  apiKey: string;
}

export interface Environment {
  analytics?: ProductEnvironment;
  experiment?: ProductEnvironment;
}

export interface PropertyConfigModel extends JsonSchemaPropertyModel {
  // property config is just JsonSchema for now
}

export interface EventConfigModel {
  description?: string;
  properties?: Record<string, PropertyConfigModel>;
  required?: string[];
}

export interface AnalyticsConfigModel {
  [eventName: string]: EventConfigModel;
}

export interface VariantModel {
  description?: string;
  key?: string;
  payload?: Record<string, JsonSchemaPropertyModel>;
}

export interface ExperimentConfigModel {
  description?: string;
  key?: string;
  variants?: Record<string, VariantModel>;
}

export interface ExperimentsConfigModel {
  [experimentName: string]: ExperimentConfigModel;
}

export interface UserConfigModel {
  properties?: Record<string, PropertyConfigModel>;
  required?: string[];
}

export interface AmplitudeConfigModel {
  settings: CodeGenerationSettingsModel;
  environments: Record<string, Environment>;
  user: UserConfigModel;
  analytics?: AnalyticsConfigModel;
  experiments?: ExperimentsConfigModel;
}

export function parseFromYaml(yaml: string): AmplitudeConfigModel {
  const config: AmplitudeConfigModel = parse(yaml);
  return config ?? {} as AmplitudeConfigModel;
}

export interface ConfigValidation {
  valid: boolean;
  errors?: string[];
}

export const ErrorMessages = Object.freeze({
  MissingSettings: `Missing 'settings' in configuration YML'.`,
  MissingPlatform: `Missing 'settings.platform' in configuration YML'.`,
  MissingOutputPath: `Missing 'settings.output' in configuration YML'.`,
  InvalidPlatform: (platform: string) => `Invalid 'settings.platform'="${platform}".`,
});

export function isValid(config: AmplitudeConfigModel): ConfigValidation {
  let valid = true;
  const errors: string[] = [];

  let hasSettings = !!(config.settings);

  if (!hasSettings) {
    valid = false;
    errors.push(ErrorMessages.MissingSettings)
  } else {
    let hasOutputPath = !!(config.settings.output);
    if (!hasOutputPath) {
      errors.push(ErrorMessages.MissingOutputPath)
    }
    let hasPlatform = !!(config.settings.platform);
    if (!hasPlatform) {
      errors.push(ErrorMessages.MissingPlatform)
    } else {
      const { platform } = config.settings;
      let hasValidPlatform = allPlatforms.has(platform);
      if (!hasValidPlatform) {
        valid = false;
        errors.push(ErrorMessages.InvalidPlatform(platform));
      }
    }
    valid = valid && hasOutputPath && hasPlatform;
  }

  return {
    valid,
    errors: errors.length > 0 ? errors : undefined,
  };
}
