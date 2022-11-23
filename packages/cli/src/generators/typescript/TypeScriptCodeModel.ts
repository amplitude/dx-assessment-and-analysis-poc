import { camelCase, isEmpty } from 'lodash';
import createTab from "../util/createTab";
import { upperCamelCase } from "../util/string";
import { JsonSchemaPropertyModel } from "../../json-schema";
import { PropertyConfigModel } from "../../config/PropertyConfigModel";

export interface CodeLanguage {
  getClassName(name:string): string;
  getMethodName(name:string): string;
  getPropertyName(name:string): string;
  getVariableName(name: string): string;

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
  getClassName(name: string  = 'unknown'): string {
    return upperCamelCase(name);
  }

  getMethodName(name: string = 'unknown'): string {
    return camelCase(name);
  }

  getVariableName(name: string  = 'unknown'): string {
    return camelCase(name);
  }

  getPropertyName(name: string = 'unknown'): string {
    return camelCase(name);
  }

  tab = createTab(2);
  tabExceptFirstLine = createTab(2, false);

  getPropertyType = (schema: JsonSchemaPropertyModel): string => {
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
      case "string":
        return 'string';
    }

    if (schema.type === 'array') {
      if (!isEmpty(schema.items)) {
        return `${this.getPropertyType(schema.items as any)}[]`;
      }
      return this.getPropertyType(schema.items as any);
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
