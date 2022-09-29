export type JsonSchema = {
  $id: string;
  $schema: string;
  title: string;
  description: string;
  type: string;
  properties: any;
  additionalProperties: boolean;
  required?: any[];
};

export class EzSchema {
  constructor(public schema: JsonSchema) {}

  isArray() {
    return this.schema.type === 'array';
  }

  isBoolean() {
    return this.schema.type === 'boolean';
  }

  isString() {
    return this.schema.type === 'string';
  }

  isObject() {
    return this.schema.type === 'object';
  }
}
