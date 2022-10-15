import { camelCase, isEmpty, upperFirst } from 'lodash';
import { PropertyConfigModel } from "../../config";
import createTab from "../util/createTab";
import { JsonSchemaPropertyModel } from "../../json-schema";

function upperCamelCase(str: string) {
  return upperFirst(camelCase(str));
}

export interface CodeLanguage {
  getVariableName(name: string): string;
  getClassName(name:string): string;
  getMethodName(name:string): string;

  /**
   * e.g.
   *   'object': any;
   *   'integer': number
   *   'number': number
   * @param name
   */
  getPropertyType(propertySchema: PropertyConfigModel): string;
}

export interface CodeParameter {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  defaultValue?: string;
}

export class TypeScriptCodeLanguage implements CodeLanguage {
  getClassName(name: string): string {
    return upperCamelCase(name);
  }

  getMethodName(name: string): string {
    return camelCase(name);
  }

  getVariableName(name: string): string {
    return camelCase(name);
  }

  tab = createTab(2);
  tabExceptFirstLine = createTab(2, false);

  getPropertyType(schema: JsonSchemaPropertyModel): string {
    switch(schema.type) {
      case "boolean":
        return 'boolean';
      case "integer":
      case "number":
        return 'number';
      case "null":
        return 'null';
      case "object":
        return 'any'
    }

    if (schema.type === 'array') {
      if (!isEmpty(schema.items)) {
        return `${this.getPropertyType(schema.items)}[]`;
      }
      return this.getPropertyType(schema.items);
    }

    // default to 'any' for unsupported types
    return 'any';
  }

  getFunctionParameter(parameter: CodeParameter): string {
    if (parameter.required || !parameter.defaultValue) {
      return `${parameter.name}${parameter.required ? '' : '?'}: ${parameter.type}`;
    }

    return `${parameter.name}: ${parameter.type} = ${parameter.defaultValue}`;
  }
}
