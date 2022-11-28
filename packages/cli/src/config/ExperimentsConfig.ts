import { cloneDeep, isEmpty, kebabCase, keyBy } from "lodash";
import { stringify } from 'yaml';
import { sortAlphabetically } from "../generators/util/sorting";
import { JsonSchemaPropertyModel } from "../json-schema";
import { ExperimentFlagModel } from "../services/experiment/models";
import { omitDeep } from "../util/omitDeep";

export interface VariantModel {
  description?: string;
  key?: string;
}

export interface FlagConfigModel {
  description?: string;
  key?: string;
  payload?: JsonSchemaPropertyModel;
  variants?: Record<string, VariantModel>;
}

export interface ExperimentsConfigModel {
  flags?: {
    [experimentName: string]: FlagConfigModel
  };
}

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

export function convertToFlagConfigModel(model: ExperimentFlagModel): FlagConfigModel {
  return {
    key: model.key,
    payload: undefined,
    description: model.description,
    variants: keyBy(model.variants, 'key')
  }
}

export function convertFlagArrayToMap(flags: FlagConfigModel[]): Record<string, FlagConfigModel> {
  const flagMap: Record<string, FlagConfigModel> = {};

  flags.reduce((acc: Record<string, FlagConfigModel>, flag) => {
    const name = (flag as any).name || flag.key;

    const payload = flag.payload.type == "object" ? undefined : {
      payload: flag.payload
    };

    acc[name] = {
      key: flag.key,
      description: flag.description,
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
      const expModel = this.model.flags![name];
      const variantNames = expModel.variants ? Object.keys(expModel.variants) : [];

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

  getFlags(): FlagConfigModel[] {
    return this.getExperimentNames().map(name => {
      const flag = this.model.flags[name];
      const variantNames = Object.keys(flag.variants);

      const variants: Record<string, VariantModel> = variantNames.reduce((acc: Record<string, VariantModel>, variantName) => {
        acc[variantName] = {
          key: variantName
        };
        return acc;
      }, {});

      return {
        key: kebabCase(name),
        name,
        description: flag.description,
        payload: flag.payload || { type: "object" },
        variants
      }
    });
  }

  setFlags(flags: FlagConfigModel[]) {
    this.model.flags = convertFlagArrayToMap(flags);
  }
}
