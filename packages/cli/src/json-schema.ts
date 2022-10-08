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
  name?: string;  // Name is used for code generation
  description?: string;
  type: JsonSchemaType;
  properties?: Record<string, JsonSchemaPropertyModel>;
  additionalProperties?: boolean;
  required?: string[];
  const?: any;
  enum?: any[];
  items?: {
    type: JsonSchemaType;
  };
  minimum?: number;
  maximum?: number;
}

export interface JsonSchemaModel extends JsonSchemaPropertyModel {
  $id: string;
  $schema: string;
}

export function getPropertiesArray(schema: JsonSchemaPropertyModel): JsonSchemaPropertyModel[] {
  const keys = Object.keys(schema.properties ?? {});

  return keys.map(key => ({
    name: key,
    ...schema.properties[key]
  }));
}

export function isConstProperty(schema: JsonSchemaPropertyModel): boolean {
  return schema.const !== undefined;
}

export function getConstProperties(schema: JsonSchemaPropertyModel): JsonSchemaPropertyModel[] {
  return getPropertiesArray(schema).filter(isConstProperty);
}

export function hasConstProperties(schema: JsonSchemaPropertyModel): boolean {
  return getConstProperties(schema).length > 0;
}

export function getNonConstProperties(schema: JsonSchemaPropertyModel) {
  return getPropertiesArray(schema).filter((p) => !isConstProperty(p));
}

export function hasNonConstProperties(schema: JsonSchemaPropertyModel): boolean {
  return getNonConstProperties(schema).length > 0;
}

export function removeConstProperties(schema: JsonSchemaPropertyModel): JsonSchemaPropertyModel {
  getConstProperties(schema).forEach(c => delete schema.properties[c.name])

  return schema;
}

export class JsonSchema {
  constructor(
    private schema: JsonSchemaPropertyModel
  ) {}

  raw(): JsonSchemaPropertyModel {
    return this.schema;
  }

  properties(): JsonSchemaPropertyModel[] {
    // TODO: Memoize?
    return getPropertiesArray(this.schema);
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

  isConstProperty = () => isConstProperty(this.schema);

  getConstProperties() {
    return this.properties().filter(isConstProperty);
  }

  hasConstProperties(): boolean {
    return this.getConstProperties().length > 0;
  }

  getNonConstProperties = () => getNonConstProperties(this.schema);
  hasNonConstProperties = () => hasNonConstProperties(this.schema);
}
