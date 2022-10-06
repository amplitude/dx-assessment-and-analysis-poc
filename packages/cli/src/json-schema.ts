export type JsonSchemaType =
  | 'boolean'
  | 'integer'
  | 'number'
  | 'object'
  | 'string'
  | 'array'
  | 'null';

export interface JsonSchemaPropertyModel {
  title?: string;
  description?: string;
  type: JsonSchemaType;
  properties?: Record<string, JsonSchemaPropertyModel>;
  additionalProperties?: boolean;
  required?: string[];
  const?: any;
  items?: {
    type: JsonSchemaType;
  };
}

export interface JsonSchemaModel extends JsonSchemaPropertyModel {
  $id: string;
  $schema: string;
}

function isConstProperty(schema: JsonSchemaPropertyModel): boolean {
  return schema.const !== undefined;
}

export class JsonSchema {
  constructor(
    private schema: JsonSchemaPropertyModel
  ) {}

  properties(): JsonSchemaPropertyModel[] {
    // TODO: Memoize?
    return Object.values(this.schema.properties) ?? [];
  }

  getPropertyNames(): string[] {
    return Object.keys(this.schema.properties);
  }

  hasProperties(): boolean {
    return Object.keys(this.schema.properties).length > 0;
  }

  hasRequiredProperties() {
    return this.properties().some((p) => p.required);
  }

  isConstProperty(): boolean {
    return isConstProperty(this.schema);
  }

  getConstProperties() {
    return this.properties().filter(isConstProperty);
  }

  hasConstProperties(): boolean {
    return this.getConstProperties().length > 0;
  }

  getNonConstProperties() {
    return this.properties().filter((p) => !isConstProperty(p));
  }

  hasNonConstProperties() {
    return this.getNonConstProperties().length > 0;
  }
}
