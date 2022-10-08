import { CodeBlock, CodeBlockTag, CodeGenerator } from "../code-generator";
import { AnalyticsConfigModel } from "../../config";
import { TypeScriptCodeLanguage } from "./TypeScriptCodeModel";
import { hasNonConstProperties, JsonSchemaPropertyModel, removeConstProperties } from "../../json-schema";
import { jsonSchemaToTypeScript } from "./jsonSchemaToTypeScript";

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
      ...this.model[name],
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

    return CodeBlock.from(CodeBlockTag.Default, ...eventPropertiesTypes);
  }

  generateEventClasses(): CodeBlock {
    const { getClassName } = this.lang;
    const getEventProperties = (event: JsonSchemaPropertyModel) => hasNonConstProperties(event)
      ? `\n  constructor(public event_properties: ${getClassName(event.title)}Properties) {}`
      : '';

    return CodeBlock.from(CodeBlockTag.Default, ...this.config.getEventSchemas().map(event => `\
export class ${getClassName(event.title)} implements AnalyticsEvent {
  event_type = '${event.title}';${getEventProperties(event)}
}
`));
  }

  async generate(): Promise<CodeBlock> {
    const { tab, getMethodName, getClassName } = this.lang;
    const eventSchemas = this.config.getEventSchemas();
    const getEventParams = (event: JsonSchemaPropertyModel) => hasNonConstProperties(event)
      ? `properties: ${getClassName(event.title)}Properties`
      : '';
    const getPassThruParams = (event: JsonSchemaPropertyModel) => hasNonConstProperties(event)
      ? `properties`
      : '';

    return CodeBlock.from(
        CodeBlockTag.Import,
        `import { AnalyticsEvent, IAnalyticsClient as IAnalyticsClientCore } from "@amplitude/analytics-core";`
      )
      .addAs(CodeBlockTag.Export, `export type { AnalyticsEvent };`)
      .add(`\
/**
 * ANALYTICS
 */`)
      .merge(await this.generateEventPropertiesTypes())
      .merge(await this.generateEventClasses())
      .add(`\
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
