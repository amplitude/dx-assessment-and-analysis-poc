import { PropertyKindModel } from './PropertyKindModel';
import PropertyTypeModel from './PropertyTypeModel';

export type PropertyModel = {
  id: string;

  workspaceId: string;
  initialVersionId: string;
  versionId: string;
  propertyRevisionId: string;

  kind: PropertyKindModel;
  origin: PropertyOriginModel;

  name: string;
  description: string;
  required: boolean;
  type: PropertyTypeModel;
  typeTemplateId: string | null;
  schema: PropertySchemaModel;
  example: string;
  isDeleted: boolean;
  isHidden: boolean;

  active: boolean;
  createdBy: string;
  dateCreated: Date;
};

export enum PropertyOriginModel {
  Customer = 'customer',
  Amplitude = 'amplitude',
}

export type PropertySchemaItemType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'array'
  | 'object'
  | 'null';

export type PropertySchemaModel = {
  pattern?: string;
  enum?: string[];
  const?: any;
  minLength?: number;
  maxLength?: number;
  items?: {
    type: PropertySchemaItemType;
  };
  minItems?: number;
  maxItems?: number;
  minimum?: number;
  maximum?: number;
  uniqueItems?: boolean;
  type?: PropertySchemaItemType;
  required?: string[];
  properties?: Record<string, PropertySchemaModel>;
  additionalProperties?: boolean;
  description?: string;
  isDeleted?: boolean;
};

export type EventPropertyModel = PropertyModel & {
  eventId: string;
};

export type TemplatePropertyModel = PropertyModel & {
  templateId: string;
};

/**
 * A flattened model for ExportService that contains the data from
 * PropertyModel, Govern, and ObserveData
 */
export interface ExportableAugmentedEventProperty {
  name: string;
  description?: string | undefined;
  type: string;
  schemaStatus: string; // TODO narrow the typing
  required?: boolean;
  isArray?: boolean;
  enumValues?: string[];
  constValue?: string | boolean | number;
  regex?: string;
  stringMinLength?: number;
  stringMaxLength?: number;
  numberMinValue?: number;
  numberMaxValue?: number;
  arrayMinItems?: number;
  arrayMaxItems?: number;
  firstSeen?: string;
  lastSeen?: string;
}

/**
 * A flattened model for ExportService that contains the data from
 * PropertyModel, Govern, and ObserveData
 */
export interface ExportableAugmentedTemplateProperty
  extends ExportableAugmentedEventProperty {
  templateName: string;
}
