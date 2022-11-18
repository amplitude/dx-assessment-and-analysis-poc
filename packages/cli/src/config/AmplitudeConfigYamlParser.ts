import * as fs from "fs";
import * as path from "path";
import { parse, stringify } from 'yaml';
import { AmplitudeConfig, AmplitudeConfigModel } from "./AmplitudeConfig";
import { allPlatforms } from "./CodeGenerationConfig";

export function parseFromYaml(yaml: string): AmplitudeConfigModel {
  const config: AmplitudeConfigModel = parse(yaml);
  return config ?? {} as AmplitudeConfigModel;
}

export function parseFromYamlAndBack(yaml: string): string {
  const config = parse(yaml);
  return stringify(config ?? {}, {});
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

export function loadLocalConfiguration(configPath: string): AmplitudeConfig {
  console.log(`Config Path:`, configPath);

  const ymlConfig = fs.readFileSync(path.resolve(configPath), 'utf8');

  const configModel = parseFromYaml(ymlConfig);

  console.log(parseFromYamlAndBack(ymlConfig));

  const configValidation = isValid(configModel);
  if (!configValidation.valid) {
    throw new Error(`Error loading configuration from ${configPath}. ${configValidation.errors}`);
  }

  return new AmplitudeConfig(configModel);
}
