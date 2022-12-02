import {
  PropertyModel,
  PropertySchemaItemType,
  PropertySchemaModel,
} from './PropertyModel';
import PropertyTypeModel from './PropertyTypeModel';
import { MarkdownUtil } from './MarkdownUtil';
import RulesDescriptionFormatter from './rules_description_formatter';
import { User, getUsername } from "./UserUtil";
import { JsonSchemaModel, JsonSchemaType } from "../../../json-schema";

export default class SchemaGen {
  static generateEventSchema(
    workspaceId: string,
    name: string,
    schemaVersion: string,
    description: string | null | undefined,
    properties: PropertyModel[],
  ): JsonSchemaModel {
    return SchemaGen.generateSchema(
      `https://data.amplitude.com/${workspaceId}/event/${encodeURIComponent(name)}/version/${schemaVersion}`,
      name,
      description,
      properties,
    );
  }

  static generateTemplateSchema(
    workspaceId: string,
    name: string,
    description: string | null | undefined,
    properties: PropertyModel[],
  ) {
    return SchemaGen.generateSchema(
      `https://data.amplitude.com/${workspaceId}/template/${encodeURIComponent(
        name,
      )}`,
      name,
      description,
      properties,
    );
  }

  static generateIdentifySchema(
    workspaceId: string,
    properties: PropertyModel[],
  ) {
    return SchemaGen.generateSchema(
      `https://data.amplitude.com/${workspaceId}/identify`,
      'Identify',
      '',
      properties,
    );
  }

  static generateGroupSchema(workspaceId: string, properties: PropertyModel[]) {
    return SchemaGen.generateSchema(
      `https://data.amplitude.com/${workspaceId}/group`,
      'Group',
      '',
      properties,
    );
  }

  static generateContextSchema(
    workspaceId: string,
    properties: PropertyModel[],
  ) {
    return SchemaGen.generateSchema(
      `https://data.amplitude.com/${workspaceId}/context`,
      'Context',
      '',
      properties,
    );
  }

  static generatePageSchema(workspaceId: string, properties: PropertyModel[]) {
    return SchemaGen.generateSchema(
      `https://data.amplitude.com/${workspaceId}/page`,
      'Page',
      '',
      properties,
    );
  }

  static formatPropertyDescription(property: PropertyModel): string {
    const sectionSeparator = '\n\n';
    const propertyDescription = MarkdownUtil.stripAmplImages(
      MarkdownUtil.replaceMentionsWithNames(property.description || ''),
    );
    const rules = RulesDescriptionFormatter.formatPropertyRules(property);
    const examples = property.example ? `Examples:\n${property.example}` : '';

    return [propertyDescription, rules, examples]
      .filter((s) => !!s)
      .join(sectionSeparator);
  }

  static formatEventDescription(
    event: { description?: string },
    user: User | undefined,
  ): string {
    const sectionSeparator = '\n\n';
    const eventDescription = MarkdownUtil.stripAmplImages(
      MarkdownUtil.replaceMentionsWithNames(event.description || ''),
    );
    let eventOwner = '';
    if (user) {
      eventOwner = `Owner: ${getUsername(user)}`;
    }

    return [eventDescription, eventOwner]
      .filter((s) => !!s)
      .join(sectionSeparator);
  }

  static generateSchema(
    $id: string,
    title: string,
    description: string | null | undefined,
    properties: PropertyModel[],
  ): JsonSchemaModel {
    return {
      $id,
      $schema: 'http://json-schema.org/draft-07/schema#',
      title,
      description: MarkdownUtil.stripAmplImages(
        MarkdownUtil.replaceMentionsWithNames(description || ''),
      ),
      type: 'object',
      properties: properties.reduce(
        (o: Record<string, PropertySchemaModel>, p: PropertyModel) => {
          o[p.name] = SchemaGen.generatePropertySchema(
            p.description,
            p.type,
            p.schema,
          ); // eslint-disable-line no-param-reassign

          return o;
        },
        {} as any,
      ),
      additionalProperties: false,
      required: properties.filter((p) => p.required).map((p) => p.name),
    };
  }

  static generatePropertySchema(
    description: string | null | undefined,
    type: string | number,
    schema: PropertySchemaModel,
  ) {
    // TODO: Fix this "type can be string or a number" mess once and for all
    const typeString: JsonSchemaType = SchemaGen.getPropertySchemaItemType(+type);

    return {
      description: MarkdownUtil.stripAmplImages(
        MarkdownUtil.replaceMentionsWithNames(description || ''),
      ),
      type: typeString,
      ...schema,
    };
  }

  static getPropertySchemaItemType(
    type: PropertyTypeModel,
  ): JsonSchemaType | undefined {
    switch (type) {
      case PropertyTypeModel.String:
        return 'string';
      case PropertyTypeModel.Number:
        return 'number';
      case PropertyTypeModel.Boolean:
        return 'boolean';
      case PropertyTypeModel.Array:
        return 'array';
      case PropertyTypeModel.Object:
        return 'object';
      case PropertyTypeModel.Null:
        return 'null';
      case PropertyTypeModel.Enum:
        /* enum set by .schema */
        return undefined;
      case PropertyTypeModel.Const:
        /* const set by .schema */
        return undefined;
      case PropertyTypeModel.Any:
        /* .schema.type should be undefined */
        return undefined;
      default:
        throw new Error(`Unsupported property type: ${type}`);
    }
  }
}
