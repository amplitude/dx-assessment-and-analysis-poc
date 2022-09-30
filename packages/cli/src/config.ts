import { parse } from 'yaml';

export type Platform = 'Node' | 'Browser';

export const allPlatforms: Set<Platform> = new Set<Platform>(['Node', 'Browser']);

export type Language = 'TypeScript';

export interface Settings {
  platform: Platform;
  // language: string;
  // sdk: string;
  output: string;
  outputFileName?: string;
}

export interface Config {
  settings: Settings;
}

export function parseFromYaml(yaml: string): Config {
  const config: Config = parse(yaml);
  return config;
}

export interface ConfigValidation {
  valid: boolean;
  errors?: string[];
}

export function isValid(config: Config): ConfigValidation {
  let valid = true;
  const errors: string[] = [];

  let hasSettings = !!(config.settings);

  if (!hasSettings) {
    valid = false;
    errors.push(`Missing 'settings' in configuration YML'.`)
  } else {
    let hasOutputPath = !!(config.settings.output);
    if (!hasOutputPath) {
      errors.push(`Missing 'settings.output' in configuration YML'.`)
    }
    let hasPlatform = !!(config.settings.platform);
    if (!hasPlatform) {
      errors.push(`Missing 'settings.platform' in configuration YML'.`)
    } else {
      const { platform } = config.settings;
      let hasValidPlatform = allPlatforms.has(platform);
      if (!hasValidPlatform) {
        valid = false;
        errors.push(`Invalid 'settings.platform'="${platform}".`);
      }
    }
    valid = valid && hasOutputPath && hasPlatform;
  }

  return {
    valid,
    errors: errors.length > 0 ? errors : undefined,
  };
}

