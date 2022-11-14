import { CodeBlock, CodeGenerator } from "../code-generator";
import { AmplitudeConfig } from "../../config/AmplitudeConfig";
import { TypeScriptCodeLanguage } from "./TypeScriptCodeModel";

export class EnvironmentCodeGenerator implements CodeGenerator {
  constructor(
    protected config: AmplitudeConfig,
    private lang: TypeScriptCodeLanguage = new TypeScriptCodeLanguage(),
  ) {}

  async generate(): Promise<CodeBlock> {
    const envNames = this.config.environment().getEnvironmentNames();
    const products = this.config.environment().getProductNames();

    return new CodeBlock(`\
/**
 * ENVIRONMENT
 */
export type Environment = ${envNames.map(e => `'${e}'`).join(' | ')};

export const ApiKey: Record<string, Record<Environment, string>> = {
${products.map(p => `\
  ${p}: {
${envNames.map(e => `    ${e}: '${this.config.environment().getEnvironmentValue(e, p)?.apiKey}'`).join(`,\n`)}
  }`).join(',\n')}
};`
    );
  }
}
