import { sortAlphabetically } from "../generators/util/sorting";
import { JsonSchemaPropertyModel } from "../json-schema";
import { cloneDeep, kebabCase } from "lodash";
import { ExperimentModel } from "../services/experiment/models";

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

/**
 * ExperimentsConfig
 */
export class ExperimentsConfig {
  constructor(private model: ExperimentsConfigModel) {}

  hasExperiments(): boolean {
    return Object.keys(this.model).length > 0;
  }

  getExperimentNames(): string[] {
    return Object.keys(this.model).sort(sortAlphabetically);
  }

  getExperimentSchemas(): JsonSchemaPropertyModel[] {
    return this.getExperimentNames().map(name => ({
      type: 'object',
      title: name,
      additionalProperties: false,
      ...cloneDeep(this.model[name]),
    }));
  }

  getExperiments(): ExperimentModel[] {
    return this.getExperimentNames().map(name => {
      const expModel = this.model[name];
      const variantNames = Object.keys(expModel.variants);

      return {
        key: kebabCase(name),
        name,
        variants: variantNames.map(variantName => ({
          key: variantName,
          // FIXME: How ot handle empty payload
          payload: expModel.variants[variantName]?.payload || {},
        }))
      }
    });
  }
}
