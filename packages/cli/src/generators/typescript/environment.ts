import { CodeBlock } from "../generators";
import { AmplitudeConfigModel } from "../../config";

export function getEnvironmentCode(config: AmplitudeConfigModel): CodeBlock {
  const { environments = { production: {} } } = config;
  const environmentNames = Object.keys(environments);
  const products = ['analytics', 'experiment'];

  return new CodeBlock(`\
/**
 * ENVIRONMENT
 */
export type Environment = ${environmentNames.map(e => `'${e}'`).join(' | ')};

export const ApiKey: Record<string, Record<Environment, string>> = {
${products.map(p => `\
  ${p}: {
${environmentNames.map(e => `    ${e}: '${environments[e][p]?.apiKey}'`).join(`,\n`)}
  }`).join(',\n')}
};`)
}
