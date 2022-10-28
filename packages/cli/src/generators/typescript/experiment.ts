import { CodeBlock, CodeBlockTag, CodeGenerator } from "../code-generator";
import {
  AnalyticsConfigModel,
  CodeGenerationSettings,
  CodeGenerationSettingsModel,
  ExperimentsConfigModel
} from "../../config";
import { CodeParameter, TypeScriptCodeLanguage } from "./TypeScriptCodeModel";
import {
  hasNonConstProperties,
  hasNonConstRequiredProperties,
  isConstProperty,
  JsonSchema,
  JsonSchemaPropertyModel,
  removeConstProperties
} from "../../json-schema";
import { cloneDeep, kebabCase } from "lodash";
import { ExperimentCodeGenerator } from "../../services/experiment/ExperimentCodeGenerator";
import { ExperimentModel } from "../../services/experiment/models";
import { sortAlphabetically } from "../util/sorting";

export class ExperimentsConfig {
  constructor(private model: ExperimentsConfigModel) {}

  hasExperiments(): boolean {
    return Object.keys(this.model).length > 0;
  }

  getExperimentNames(): string[] {
    return Object.keys(this.model).sort(sortAlphabetically);
  }

  getExperimentSchemas(): JsonSchemaPropertyModel[] {
    return this.getExperimentNames().map(name => ({
      type: 'object',
      title: name,
      additionalProperties: false,
      ...cloneDeep(this.model[name]),
    }));
  }

  getExperiments(): ExperimentModel[] {
    return this.getExperimentNames().map(name => {
      const expModel = this.model[name];
      const variantNames = Object.keys(expModel.variants);

      return {
        key: kebabCase(name),
        name,
        variants: variantNames.map(variantName => ({
          key: variantName,
          // FIXME: How ot handle empty payload
          payload: expModel.variants[variantName]?.payload || {},
        }))
      }
    });
  }
}

export class ExperimentCoreCodeGenerator implements CodeGenerator<ExperimentsConfigModel> {
  private experimentsConfig: ExperimentsConfig;
  private codegenConfig: CodeGenerationSettings;

  constructor(
    experimentsModel: ExperimentsConfigModel,
    codegenModel: CodeGenerationSettingsModel,
    private lang: TypeScriptCodeLanguage = new TypeScriptCodeLanguage(),
  ) {
    this.experimentsConfig = new ExperimentsConfig(experimentsModel);
    this.codegenConfig = new CodeGenerationSettings(codegenModel);
  }

//   async generateEventPropertiesTypes(): Promise<CodeBlock> {
//     const eventPropertiesTypes = await Promise.all(this.config.getEventSchemas()
//       .filter(schema => hasNonConstProperties(schema))
//       .map(schema => removeConstProperties(schema))
//       .map(async (schema) => {
//         // For "Properties" postfix to interfaces
//         schema.title = `${schema.title || 'Undefined'} Properties`
//         return await jsonSchemaToTypeScript(schema);
//       }));
//
//     return CodeBlock.from(CodeBlockTag.Default, ...eventPropertiesTypes);
//   }
//
//   protected generatePropertiesLiteralWithConsts(
//     schema: JsonSchemaPropertyModel,
//     defaultValue: string,
//     propertiesName = 'event_properties',
//   ): string {
//     const { tab } = this.lang;
//     const s = new JsonSchema(schema);
//     const constProperties = s.getConstProperties();
//     const hasProps = s.hasNonConstProperties();
//
//     const constFields = constProperties
//       .map((p) => `'${p.name}': ${JSON.stringify(p.const)},`)
//       .join('\n');
//
//     if (hasProps && constProperties.length > 0) {
//       return `\
// {
//   ...${propertiesName},
// ${tab(1, constFields)}
// }`;
//     }
//
//     if (constProperties.length > 0) {
//       return `{
// ${tab(1, constFields)}
// }`;
//     }
//
//     if (hasProps) {
//       return propertiesName;
//     }
//
//     return defaultValue;
//   }
//
//   protected generatePropertyConstsType(schema: JsonSchemaPropertyModel): string {
//     const event = new JsonSchema(schema);
//     const constProperties = event.getConstProperties();
//     if (constProperties.length === 0) {
//       return '{}';
//     }
//
//     const constFields = constProperties
//       .map((p) => `'${p.name}': ${JSON.stringify(p.const)};`)
//       .join('\n');
//
//     return `{
// ${this.lang.tab(1, constFields)}
// }`;
//   }
//
//   protected generateFunctionParameters(parameters: CodeParameter[], tabs = 2,): string {
//     const { tab } = this.lang;
//
//     if (parameters.length < 1) {
//       return '';
//     }
//     const result = `\n${parameters
//       .map((p) => tab(tabs, `${this.lang.getFunctionParameter(p)},`))
//       .join('\n')}\n${tab(tabs - 1, '|')}`;
//
//     return result.substr(0, result.length - 1);
//   }
//
//   generateEventClassesLegacy(): CodeBlock {
//     const { getClassName, tab } = this.lang;
//     const getEventProperties = (event: JsonSchemaPropertyModel) => hasNonConstProperties(event)
//       ? `\n  constructor(public event_properties: ${getClassName(event.title)}Properties) {}`
//       : '';
//
//     return CodeBlock.from(CodeBlockTag.Default, ...this.config.getEventSchemas().map(event => `\
// export class ${getClassName(event.title)} implements AnalyticsEvent {
//   event_type = '${event.title}';${getEventProperties(event)}
// ${tab(1, this.generatePropertiesLiteralWithConsts(event, ''))}
// }
// `));
//   }
//
//   generateEventClasses(): CodeBlock {
//     const classes = this.config.getEventSchemas().map(schema => {
//       const { getClassName, tab, tabExceptFirstLine } = this.lang;
//       const event = new JsonSchema(schema);
//       const propertiesClassName = `${getClassName(schema.title)}Properties`;
//       const propertiesField= 'event_properties';
//       const eventTypeField = 'event_type';
//       const baseEventType = 'AnalyticsEvent';
//
//       const hasConstProperties = event.hasConstProperties();
//       const hasNonConstProperties = event.hasNonConstProperties();
//       const hasRequiredProperties = event.hasRequiredProperties(p => !isConstProperty(p));
//
//       const constructorParameters: CodeParameter[] = [];
//       if (hasNonConstProperties) {
//         constructorParameters.push({
//           name: hasConstProperties ? propertiesField : `public ${propertiesField}`,
//           type: propertiesClassName,
//           required: hasRequiredProperties,
//         });
//       }
//
//       const propertiesDeclaration = !hasConstProperties
//         ? ''
//         : `
//   ${propertiesField}${hasNonConstProperties ? `: ${propertiesClassName} & ` : ' = '
//         }${tabExceptFirstLine(
//           1,
//           hasNonConstProperties
//             ? this.generatePropertyConstsType(schema)
//             : this.generatePropertiesLiteralWithConsts(schema, '', propertiesField),
//         )};`;
//
//       let constructorBody = '';
//       if (constructorParameters.length > 0) {
//         constructorBody = !hasConstProperties
//           ? `constructor(${this.generateFunctionParameters(
//             constructorParameters, 1,
//           )}) ${hasNonConstProperties ? `{
//   this.${propertiesField} = ${propertiesField};
// }` : {}}`
//           : `\
// constructor(${this.generateFunctionParameters(constructorParameters, 1)}) {
//   this.${propertiesField} = ${tabExceptFirstLine(
//             1, this.generatePropertiesLiteralWithConsts(schema, '{}', propertiesField,
//             ))};
// }`;
//         constructorBody = `\n\n${tab(1, constructorBody)}`;
//       }
//
//       return `
// export class ${getClassName(schema.title)} implements ${baseEventType} {
//   ${eventTypeField} = '${schema.title}';${propertiesDeclaration}${constructorBody}
// }`;
//     })
//       .join('\n')
//       .trim();
//
//     return new CodeBlock(classes.length ? `\n${classes}\n` : '');
//   }

  async generate(): Promise<CodeBlock> {
    const { tab, getMethodName, getClassName } = this.lang;

    const generator = new ExperimentCodeGenerator();

    return generator.generateXpntWrapper(this.experimentsConfig, this.codegenConfig);
  }
}
