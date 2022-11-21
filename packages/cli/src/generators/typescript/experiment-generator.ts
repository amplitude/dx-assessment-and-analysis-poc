import { CodeBlock, CodeGenerator } from "../code-generator";
import { TypeScriptCodeLanguage } from "./TypeScriptCodeModel";
import { ExperimentModel, VariantModel } from "../../services/experiment/models";
import { DuplicateNameMappingDetector } from "../DuplicateNameMappingDetector";
import { AmplitudeConfig } from "../../config/AmplitudeConfig";

/**
 * ExperimentCoreCodeGenerator
 *
 * Shared across Browser & Node
 */
export class ExperimentCoreCodeGenerator implements CodeGenerator {
  constructor(
    protected config: AmplitudeConfig,
    private lang: TypeScriptCodeLanguage = new TypeScriptCodeLanguage(),
  ) {}

  generateExperimentType(experiment: ExperimentModel): string {
    const { getClassName, getPropertyName, getPropertyType } = this.lang;
    const className = getClassName(experiment.name);

    return `\
export type ${className} = {
  key: '${experiment.key}';
  name: "${experiment.name}";
${experiment.variants.map(
      v => `\
  ${getPropertyName(v.key)}: {
    key: '${v.key}',
    payload: ${getPropertyType(v.payload)}
  };`,
    ).join('\n')}
};`;
  }

  generateExperimentClass(experiment: ExperimentModel): string {
    const { getClassName, getPropertyName, getPropertyType } = this.lang;

    const className = getClassName(experiment.name);
    const getVariantTypeName = (v: VariantModel) => `${getClassName(v.key)}`;

    return `\
/* ${experiment.name} */
export namespace ${className}Variants {
${experiment.variants.map(v => `\
  export type ${getVariantTypeName(v)} = { key: '${v.key}', payload: ${getPropertyType(v.payload)} };`).join('\n')}

  export enum Keys {
${experiment.variants.map(v => `\
    ${getVariantTypeName(v)} = '${v.key}'`).join(',\n')}
  }
}
export type ${className}Type = BaseExperiment & {
${experiment.variants.map(v => `\
  ${getPropertyName(v.key)}?: ${className}Variants.${getVariantTypeName(v)};`).join('\n')}
}
export class ${className} implements ${className}Type {
  key = '${experiment.key}';
  name = "${experiment.name}";
  variant: ${experiment.variants.map(v => `\
${className}Variants.${getVariantTypeName(v)}`).join(' |')} | undefined;

  constructor(
${experiment.variants.map(v => `\
    public ${getPropertyName(v.key)}?: ${className}Variants.${getVariantTypeName(v)},`).join('\n')}
  ) {}
}
export namespace ${className} {
  export const Key = '${experiment.key}';
  export const Name = "${experiment.name}";

  export enum Variants {
${experiment.variants.map(v => `\
    ${getClassName(v.key)} = '${v.key}'`).join(',\n')}
  }
}`;
  }

  generateExperimentMethod(experiment: ExperimentModel): string {
    const { getClassName, getMethodName } = this.lang;

    const className = getClassName(experiment.name);
    const methodName = getMethodName(experiment.name);

    return `\
  ${methodName}(): ${className} {
    return core.getTypedVariant(new ${className}());
  }`;
  }

  async generate(): Promise<CodeBlock> {
    const { tab, getMethodName, getClassName } = this.lang;

    // detect duplicate names
    // since the name mapping might map previously non-conflicting names to the same value (camelCase, etc)
    const duplicateDector = new DuplicateNameMappingDetector(getMethodName);
    const filteredExperiments = this.config.experiment().getExperiments().filter(e => {
      if (duplicateDector.hasDuplicateNameMapping(e.name)) {
        console.log(`Experiment "${e.name}" has a duplicate name mapping as another  and will be removed.`); // eslint-disable-line no-console
        return false;
      }
      return true;
    });

    return CodeBlock.code(`\
export type BaseExperiment = {
  key: string;
  name: string;
}

${filteredExperiments.map(e => this.generateExperimentClass(e)).join('\n\n')}
export interface VariantMethods {
${filteredExperiments.map(e => `  ${getMethodName(e.name)}(): ${getClassName(e.name)};`).join('\n')}
}

export class VariantMethodsClient implements VariantMethods {
  constructor(private client: IExperimentClientCore) {}

  private getTypedVariant<T extends BaseExperiment>(exp: T) {
    const variant = this.client.variant(exp.key);
    if (typeof variant === 'string') {
      // FIXME: how to handle string responses?
      // (exp as any)[variant.value] = { payload: variant.payload };
      // (exp as any)['variant'] = { key: variant.value, payload: variant.payload };
    } else {
      if (variant && variant.value) {
        (exp as any)[variant.value] = { payload: variant.payload };
        (exp as any)['variant'] = { key: variant.value, payload: variant.payload };
      }
    }
    return exp;
  }

${filteredExperiments.map(e => tab(1, `\
${getMethodName(e.name)}(): ${getClassName(e.name)} {
  return this.getTypedVariant(new ${getClassName(e.name)}());
}`)).join(`\n\n`)}
}

export interface IExperimentClient extends IExperimentClientCore, Typed<VariantMethods> {}`
    );
  }
}

/**
 * ExperimentBrowserCodeGenerator
 *
 * Browser Specific
 */
export class ExperimentBrowserCodeGenerator extends ExperimentCoreCodeGenerator {
  async generate(): Promise<CodeBlock> {
    const code = await super.generate();
    code
      .import(`\
import {
  IExperimentClient as IExperimentClientCore,
  Experiment as ExperimentBrowser,
} from "@amplitude/experiment-browser";`
      )
      .code(`\
export class Experiment extends ExperimentBrowser implements IExperimentClient {
  get typed() {
    return new VariantMethodsClient(this);
  }
}

export const experiment = new Experiment();
export const typedExperiment = experiment.typed;`
    );

    return code;
  }
}

/**
 * ExperimentNodeCodeGenerator
 *
 * Node Specific
 */
export class ExperimentNodeCodeGenerator extends ExperimentCoreCodeGenerator {
  async generate(): Promise<CodeBlock> {
    const code = await super.generate();
    code.import(`\
import {
  Experiment as ExperimentNode,
  ExperimentClient as ExperimentClientNode,
  IExperimentClient as IExperimentClientCore,
} from "@amplitude/experiment-node";`)
      .code(`\
export class ExperimentClient extends ExperimentClientNode implements IExperimentClient {
  get typed() {
    return new VariantMethodsClient(this);
  }
}

export class Experiment extends ExperimentNode {
  user(user: User): ExperimentClient {
    return new ExperimentClient(user, this.config, this, this.client);
  }

  userId(userId: string): ExperimentClient {
    return this.user(new User(userId));
  }

  deviceId(deviceId: string): ExperimentClient {
    return this.user(new User(undefined, deviceId));
  }
}

export const experiment = new Experiment();`
    );

    return code;
  }
}
