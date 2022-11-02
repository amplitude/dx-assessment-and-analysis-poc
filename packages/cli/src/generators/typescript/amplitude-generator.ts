import { EnvironmentCodeGenerator } from "./environment-generator";
import { UserCodeGenerator } from "./user-generator";
import { AnalyticsBrowserCodeGenerator, AnalyticsNodeCodeGenerator } from "./analytics-generator";
import { CodeBlock, CodeGenerator } from "../code-generator";
import {
  ExperimentBrowserCodeGenerator,
  ExperimentNodeCodeGenerator,
} from "./experiment-generator";
import { TypeScriptCodeLanguage } from "./TypeScriptCodeModel";
import { AmplitudeConfig } from "../../config/AmplitudeConfig";

export class AmplitudeCoreCodeGenerator implements CodeGenerator {
  constructor(
    protected config: AmplitudeConfig,
    private lang: TypeScriptCodeLanguage = new TypeScriptCodeLanguage(),
  ) {}

  async generate(): Promise<CodeBlock> {
    return new CodeBlock()
      .import(`\
import { AmplitudeLoadOptions as AmplitudeLoadOptionsCore, Logger, NoLogger } from "@amplitude/amplitude-core";`)
      .export(`export { Logger, NoLogger };`)
      .code(`\
/**
 * GENERAL INTERFACES
 */
export interface Typed<T> {
  get ${this.config.codegen().getTypedAnchorName()}(): T;
}`)
      .merge(
        await (new EnvironmentCodeGenerator(this.config).generate()),
        await (new UserCodeGenerator(this.config).generate()),
      )
      .code(`\
export interface AmplitudeLoadOptions extends Partial<AmplitudeLoadOptionsCore> {
  environment?: Environment,
}`
      );
  }
}

export class AmplitudeBrowserCodeGenerator extends AmplitudeCoreCodeGenerator {
  async generate(): Promise<CodeBlock> {
    const typed = this.config.codegen().getTypedAnchorName();

    const coreCode = await super.generate();

    return coreCode
      .import(`import { Amplitude as AmplitudeBrowser } from "@amplitude/amplitude-browser";`)
      .export(`export { MessageHub, hub } from "@amplitude/hub";`)
      .merge(
        await (new AnalyticsBrowserCodeGenerator(this.config).generate()),
        await (new ExperimentBrowserCodeGenerator(this.config).generate()),
      )
      .code(`\
/**
 * AMPLITUDE
 */
export class Amplitude extends AmplitudeBrowser {
  constructor(_user?: User) {
    super(_user ?? user)
  }

  get ${typed}() {
    const core = this;
    return {
      load(config: AmplitudeLoadOptions) {
        const environment = config.environment ?? 'development';
        
        // FIXME: properly read API keys
        // @ts-ignore
        const apiKey = config.apiKey ?? ApiKey['analytics'][environment];

        core.load({
          ...config,
          apiKey,
        });
        core.addPlugin(analytics);
        core.addPlugin(experiment);
      },
      get user(): User {
        return core.user as User;
      }
    }
  }
}

export const amplitude = new Amplitude();`
      );
  }
}

export class AmplitudeNodeCodeGenerator extends AmplitudeCoreCodeGenerator {
  async generate(): Promise<CodeBlock> {
    const typed = this.config.codegen().getTypedAnchorName();

    const coreCode = await super.generate();

    return coreCode
      .merge(
        await (new AnalyticsNodeCodeGenerator(this.config).generate()),
        await (new ExperimentNodeCodeGenerator(this.config).generate()),
      )
      .import(`import { Amplitude as AmplitudeNode } from "@amplitude/amplitude-node";`)
      .code(`\
/**
 * AMPLITUDE
 */
export class Amplitude extends AmplitudeNode {
  get ${typed}() {
    const core = this;
    return {
      load(config: AmplitudeLoadOptions) {
        const environment = config.environment ?? 'development';
        // FIXME: properly read API keys
        // @ts-ignore
        const apiKey = config.apiKey ?? ApiKey['analytics'][environment];

        core.load({
          ...config,
          apiKey,
        });
        core.addPlugin(analytics);
        core.addPlugin(experiment);
      },
    };
  }
}

export const amplitude = new Amplitude();`
      );
  }
}
