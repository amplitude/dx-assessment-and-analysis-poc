import { parse } from 'yaml';
import { AmplitudeConfigModel } from "./AmplitudeConfig";
import { allPlatforms } from "./CodeGenerationConfig";

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
