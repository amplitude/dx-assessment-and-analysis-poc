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

export type JsonSchemaPropertyFilter = (property: JsonSchemaPropertyModel) => boolean;

export function getPropertiesArray(schema: JsonSchemaPropertyModel): JsonSchemaPropertyModel[] {
  const keys = Object.keys(schema.properties ?? {});

  return keys.map(key => ({
    name: key,
    ...schema.properties?.[key]
  } as JsonSchemaPropertyModel));
}

export function getPropertyNames(schema: JsonSchemaPropertyModel): string[] {
  return schema.properties ? Object.keys(schema.properties) : [];
}

export function hasProperties(schema: JsonSchemaPropertyModel): boolean {
  return getPropertyNames(schema).length > 0;
}

export function hasRequiredProperties(
  schema: JsonSchemaPropertyModel,
  filter: JsonSchemaPropertyFilter = () => true,
): boolean {
  const filteredNames = filter
    ? getPropertiesArray(schema).filter(filter).map(p => p.name)
    : [];
  return !!schema.required && schema.required.filter(name => filteredNames.includes(name)).length > 0;
}

export function hasNonConstRequiredProperties(schema: JsonSchemaPropertyModel): boolean {
  return hasRequiredProperties(schema, p => !isConstProperty(p));
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
  getConstProperties(schema).forEach(c => {
    if (!!c.name) {
      delete schema.properties?.[c.name]
    }
  })

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

  hasProperties = () => hasProperties(this.schema);
  getPropertyNames = () => getPropertyNames(this.schema);

  hasRequiredProperties = (filter?: JsonSchemaPropertyFilter) => hasRequiredProperties(this.schema, filter);
  hasNonConstRequiredProperties = () => hasNonConstRequiredProperties(this.schema);

  isConstProperty = () => isConstProperty(this.schema);

  getConstProperties = () => getConstProperties(this.schema);
  hasConstProperties = () => hasConstProperties(this.schema);

  getNonConstProperties = () => getNonConstProperties(this.schema);
  hasNonConstProperties = () => hasNonConstProperties(this.schema);
}
