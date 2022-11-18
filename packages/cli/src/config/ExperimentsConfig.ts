import { cloneDeep, isEmpty, kebabCase } from "lodash";
import { stringify } from 'yaml';
import { sortAlphabetically } from "../generators/util/sorting";
import { JsonSchemaPropertyModel } from "../json-schema";
import { ExperimentFlagModel } from "../services/experiment/models";
import { omitDeep } from "../util/omitDeep";

export interface VariantModel {
  description?: string;
  key?: string;
}

export interface ExperimentConfigModel {
  description?: string;
  key?: string;
  payload?: JsonSchemaPropertyModel;
  variants?: Record<string, VariantModel>;
}

export interface ExperimentsConfigModel {
  flags?: {
    [experimentName: string]: ExperimentConfigModel
  };
}

// export function toFlagConfigModel(model: ExperimentFlagModel): ExperimentConfigModel {
//   return {
//     key: model.key,
//     payload: model.
//     variants: model.variants
//   }
// }

export function sanitizeVariants(variants: Record<string, VariantModel>): Record<string, VariantModel> {
  let cleanVariants = omitDeep(variants, ['key', 'name', 'payload']);
  const variantKeys = Object.keys(variants);
  variantKeys.forEach(key => {
    if (isEmpty(cleanVariants[key])) {
      cleanVariants[key] = null;
    }
  })

  return cleanVariants;
}

export function convertToYaml(flag: ExperimentConfigModel) {
  const name = (flag as any).name || flag.key;

  const payload = flag.payload.type == "object" ? undefined : {
    payload: flag.payload
  };
  return stringify({
    [name]: {
      key: flag.key,
      ...payload,
      variants: flag.variants,
    }
  }).replace(/ \{\}/g, '');
}

export function convertFlagArrayToMap(flags: ExperimentConfigModel[]): Record<string, ExperimentConfigModel> {
  const flagMap: Record<string, ExperimentConfigModel> = {};

  flags.reduce((acc: Record<string, ExperimentConfigModel>, flag) => {
    const name = (flag as any).name || flag.key;

    const payload = flag.payload.type == "object" ? undefined : {
      payload: flag.payload
    };

    acc[name] = {
      key: flag.key,
      ...payload,
      variants: flag.variants,
    };

    return acc;
  }, flagMap);

  return flagMap;
}

/**
 * ExperimentsConfig
 */
export class ExperimentsConfig {
  constructor(private model: ExperimentsConfigModel) {}

  hasExperiments(): boolean {
    return Object.keys(this.model.flags ?? {}).length > 0;
  }

  getExperimentNames(): string[] {
    return Object.keys(this.model.flags ?? {}).sort(sortAlphabetically);
  }

  getExperimentSchemas(): JsonSchemaPropertyModel[] {
    return this.getExperimentNames().map(name => ({
      type: 'object',
      title: name,
      additionalProperties: false,
      ...cloneDeep(this.model.flags?.[name]),
    }));
  }

  getExperiments(): ExperimentFlagModel[] {
    return this.getExperimentNames().map(name => {
      const expModel = this.model.flags[name];
      const variantNames = Object.keys(expModel.variants);

      return {
        key: kebabCase(name),
        name,
        variants: variantNames.map(variantName => ({
          key: variantName,
          // FIXME: How ot handle empty payload
          payload: expModel.payload || {},
        }))
      }
    });
  }

  getFlags(): ExperimentConfigModel[] {
    return this.getExperimentNames().map(name => {
      const expModel = this.model.flags[name];
      const variantNames = Object.keys(expModel.variants);

      const variants: Record<string, VariantModel> = variantNames.reduce((acc: Record<string, VariantModel>, variantName) => {
        acc[variantName] = {
          key: variantName
        };
        return acc;
      }, {});

      return {
        key: kebabCase(name),
        name,
        payload: expModel.payload || { type: "object" },
        variants
      }
    });
  }

  setFlags(flags: ExperimentConfigModel[]) {
    this.model.flags = convertFlagArrayToMap(flags);
  }
}
