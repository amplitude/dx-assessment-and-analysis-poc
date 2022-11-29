import * as fs from "fs";
import * as path from "path";
import { parse, stringify } from 'yaml';
import { AmplitudeConfig, AmplitudeConfigModel } from "./AmplitudeConfig";
import { allPlatforms } from "./CodeGenerationConfig";
import { cloneDeep, isEmpty } from "lodash";
import { sanitizeVariants } from "./ExperimentsConfig";
import { ICON_INFO } from "../ui/icons";
import { JsonSchemaModel } from "../json-schema";
import { sortAlphabetically } from "../generators/util/sorting";

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

export function loadLocalConfiguration(configPath: string): AmplitudeConfig {
  console.log(`${ICON_INFO} Local Config:`, configPath);

  const ymlConfig = fs.readFileSync(path.resolve(configPath), 'utf8');

  const configModel = parseFromYaml(ymlConfig);

  const configValidation = isValid(configModel);
  if (!configValidation.valid) {
    throw new Error(`Error loading configuration from ${configPath}. ${configValidation.errors}`);
  }

  return new AmplitudeConfig(configModel);
}

export function saveYamlToFile(filePath: string, config: AmplitudeConfig) {
  // Clean up variants prior to output
  const outputConfig: AmplitudeConfigModel = cloneDeep(config.model)

  const flagKeys = Object.keys(outputConfig.experiment.flags);
  flagKeys.forEach(flagKey => {
    const flag = outputConfig.experiment.flags[flagKey];
    if (isEmpty(flag.description)) {
      delete flag.description;
    }
    flag.variants = sanitizeVariants(flag.variants);
  })

  const yamlContents = stringify(outputConfig);

  fs.writeFileSync(filePath, yamlContents);
}

export function saveEventSchemaYamlToFile(filePath: string, eventSchemas: JsonSchemaModel[]) {
  // Clean up prior to output
  const eventMap = {};
  eventSchemas
    .sort((a, b) => sortAlphabetically(a.title, b.title))
    .forEach(event => {
    const sanitizedEvent: any = {};
    // description
    if (!isEmpty(event.description)) {
      sanitizedEvent.description = event.description;
    }

    // properties
    const propertyNames = Object.keys(event.properties);
    if (propertyNames.length > 0) {
      let properties = {};
      propertyNames.forEach(propName => {
        const prop = event.properties[propName];
        const sanitizedProp = { ...prop };
        if (!prop.type) {
          delete sanitizedProp.type;
        }
        if (isEmpty(prop.description)) {
          delete sanitizedProp.description;
        }
        properties[propName] = sanitizedProp;
      })
      sanitizedEvent.properties = properties;
    }

    // required
    if (!isEmpty(event.required)) {
      sanitizedEvent.required = event.required;
    }

    eventMap[event.title] = sanitizedEvent;
  });

  const yamlContents = stringify(eventMap);

  fs.writeFileSync(filePath, yamlContents);
}
