import { CodeBlock, CodeGenerator } from "../code-generator";
import { AnalyticsConfigModel } from "../../config";
import { CodeParameter, TypeScriptCodeLanguage } from "./TypeScriptCodeModel";
import {
  hasNonConstProperties,
  hasNonConstRequiredProperties,
  isConstProperty,
  JsonSchema,
  JsonSchemaPropertyModel,
  removeConstProperties
} from "../../json-schema";
import { jsonSchemaToTypeScript } from "./jsonSchemaToTypeScript";
import { cloneDeep } from "lodash";

export class AnalyticsConfig {
  constructor(private model: AnalyticsConfigModel) {}

  hasEvents(): boolean {
    return Object.keys(this.model).length > 0;
  }

  getEventNames(): string[] {
    return Object.keys(this.model);
  }

  getEventSchemas(): JsonSchemaPropertyModel[] {
    return this.getEventNames().map(name => ({
      type: 'object',
      title: name,
      additionalProperties: false,
      ...cloneDeep(this.model[name]),
    }));
  }
}

export class AnalyticsCoreCodeGenerator implements CodeGenerator<AnalyticsConfigModel> {
  private config: AnalyticsConfig;

  constructor(
    private configModel: AnalyticsConfigModel,
    private lang: TypeScriptCodeLanguage = new TypeScriptCodeLanguage(),
  ) {
    this.config = new AnalyticsConfig(configModel);
  }

  async generateEventPropertiesTypes(): Promise<CodeBlock> {
    const eventPropertiesTypes = await Promise.all(this.config.getEventSchemas()
      .filter(schema => hasNonConstProperties(schema))
      .map(schema => removeConstProperties(schema))
      .map(async (schema) => {
        // For "Properties" postfix to interfaces
        schema.title = `${schema.title || 'Undefined'} Properties`
        return await jsonSchemaToTypeScript(schema);
      }));

    return CodeBlock.code(...eventPropertiesTypes);
  }

  protected generatePropertiesLiteralWithConsts(
    schema: JsonSchemaPropertyModel,
    defaultValue: string,
    propertiesName = 'event_properties',
  ): string {
    const { tab } = this.lang;
    const s = new JsonSchema(schema);
    const constProperties = s.getConstProperties();
    const hasProps = s.hasNonConstProperties();

    const constFields = constProperties
      .map((p) => `'${p.name}': ${JSON.stringify(p.const)},`)
      .join('\n');

    if (hasProps && constProperties.length > 0) {
      return `\
{
  ...${propertiesName},
${tab(1, constFields)}
}`;
    }

    if (constProperties.length > 0) {
      return `{
${tab(1, constFields)}
}`;
    }

    if (hasProps) {
      return propertiesName;
    }

    return defaultValue;
  }

  protected generatePropertyConstsType(schema: JsonSchemaPropertyModel): string {
    const event = new JsonSchema(schema);
    const constProperties = event.getConstProperties();
    if (constProperties.length === 0) {
      return '{}';
    }

    const constFields = constProperties
      .map((p) => `'${p.name}': ${JSON.stringify(p.const)};`)
      .join('\n');

    return `{
${this.lang.tab(1, constFields)}
}`;
  }

  protected generateFunctionParameters(parameters: CodeParameter[], tabs = 2,): string {
    const { tab } = this.lang;

    if (parameters.length < 1) {
      return '';
    }
    const result = `\n${parameters
      .map((p) => tab(tabs, `${this.lang.getFunctionParameter(p)},`))
      .join('\n')}\n${tab(tabs - 1, '|')}`;

    return result.substr(0, result.length - 1);
  }

  generateEventClassesLegacy(): CodeBlock {
    const { getClassName, tab } = this.lang;
    const getEventProperties = (event: JsonSchemaPropertyModel) => hasNonConstProperties(event)
      ? `\n  constructor(public event_properties: ${getClassName(event.title)}Properties) {}`
      : '';

    return CodeBlock.code(...this.config.getEventSchemas().map(event => `\
export class ${getClassName(event.title)} implements AnalyticsEvent {
  event_type = '${event.title}';${getEventProperties(event)}
${tab(1, this.generatePropertiesLiteralWithConsts(event, ''))}
}
`));
  }

  generateEventClasses(): CodeBlock {
    const classes = this.config.getEventSchemas().map(schema => {
      const { getClassName, tab, tabExceptFirstLine } = this.lang;
      const event = new JsonSchema(schema);
      const propertiesClassName = `${getClassName(schema.title)}Properties`;
      const propertiesField= 'event_properties';
      const eventTypeField = 'event_type';
      const baseEventType = 'AnalyticsEvent';

      const hasConstProperties = event.hasConstProperties();
      const hasNonConstProperties = event.hasNonConstProperties();
      const hasRequiredProperties = event.hasRequiredProperties(p => !isConstProperty(p));

      const constructorParameters: CodeParameter[] = [];
      if (hasNonConstProperties) {
        constructorParameters.push({
          name: hasConstProperties ? propertiesField : `public ${propertiesField}`,
          type: propertiesClassName,
          required: hasRequiredProperties,
        });
      }

      const propertiesDeclaration = !hasConstProperties
        ? ''
        : `
  ${propertiesField}${hasNonConstProperties ? `: ${propertiesClassName} & ` : ' = '
          }${tabExceptFirstLine(
            1,
            hasNonConstProperties
              ? this.generatePropertyConstsType(schema)
              : this.generatePropertiesLiteralWithConsts(schema, '', propertiesField),
          )};`;

        let constructorBody = '';
        if (constructorParameters.length > 0) {
          constructorBody = !hasConstProperties
            ? `constructor(${this.generateFunctionParameters(
              constructorParameters, 1,
            )}) ${hasNonConstProperties ? `{
  this.${propertiesField} = ${propertiesField};
}` : {}}`
            : `\
constructor(${this.generateFunctionParameters(constructorParameters, 1)}) {
  this.${propertiesField} = ${tabExceptFirstLine(
    1, this.generatePropertiesLiteralWithConsts(schema, '{}', propertiesField,
  ))};
}`;
          constructorBody = `\n\n${tab(1, constructorBody)}`;
      }

      return `
export class ${getClassName(schema.title)} implements ${baseEventType} {
  ${eventTypeField} = '${schema.title}';${propertiesDeclaration}${constructorBody}
}`;
    })
    .join('\n')
    .trim();

    return new CodeBlock(classes.length ? `\n${classes}\n` : '');
  }

  async generate(): Promise<CodeBlock> {
    const { tab, getMethodName, getClassName } = this.lang;
    const eventSchemas = this.config.getEventSchemas();
    const getEventParams = (event: JsonSchemaPropertyModel) => hasNonConstProperties(event)
      ? `properties${hasNonConstRequiredProperties(event) ? '' : '?'}: ${getClassName(event.title)}Properties`
      : '';
    const getPassThruParams = (event: JsonSchemaPropertyModel) => hasNonConstProperties(event)
      ? `properties`
      : '';

    return CodeBlock.import(
    `import { AnalyticsEvent, IAnalyticsClient as IAnalyticsClientCore } from "@amplitude/analytics-core";`
      )
      .export(`export type { AnalyticsEvent };`)
      .code(`\
/**
 * ANALYTICS
 */`)
      .merge(await this.generateEventPropertiesTypes())
      .merge(await this.generateEventClasses())
      .code(`\
export interface TrackingPlanMethods{
${eventSchemas.map(event => tab(1, `${getMethodName(event.title)}(${getEventParams(event)}): void;`))
        .join('\n')}
}

export interface IAnalyticsClient extends IAnalyticsClientCore, Typed<TrackingPlanMethods> {}

export class TrackingPlanClient implements TrackingPlanMethods {
  constructor(private analytics: IAnalyticsClientCore) {}
${eventSchemas.map(event =>  tab(1, `\
${getMethodName(event.title)}(${getEventParams(event)}) {
  this.analytics.track(new ${getClassName(event.title)}(${getPassThruParams(event)}))
}`,
  ))
  .join('\n')}
}`
      );
  }
}
