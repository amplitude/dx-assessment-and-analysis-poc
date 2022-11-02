import {
  AmplitudeConfigModel,
  CodeGenerationSettings,
} from "../../config";
import { getEnvironmentCode } from "./environment";
import { UserCodeGenerator } from "./user";
import { AnalyticsBrowserCodeGenerator, AnalyticsNodeCodeGenerator } from "./analytics";
import { CodeBlock, CodeGenerator } from "../code-generator";
import {
  ExperimentBrowserCodeGenerator,
  ExperimentNodeCodeGenerator,
} from "./experiment";
import { TypeScriptCodeLanguage } from "./TypeScriptCodeModel";
import { AmplitudeConfig } from "../../config/AmplitudeConfig";

export class AmplitudeCoreCodeGenerator implements CodeGenerator<AmplitudeConfigModel> {
  private config: AmplitudeConfig;

  constructor(
    amplitudeConfigModel: AmplitudeConfigModel,
    private lang: TypeScriptCodeLanguage = new TypeScriptCodeLanguage(),
  ) {
    this.config = new AmplitudeConfig(amplitudeConfigModel);
  }

  async generate(config: AmplitudeConfigModel): Promise<CodeBlock> {
    const codegenSettings = new CodeGenerationSettings(config.settings);

    return new CodeBlock()
      .import(`\
import { AmplitudeLoadOptions as AmplitudeLoadOptionsCore, Logger, NoLogger } from "@amplitude/amplitude-core";`)
      .export(`export { Logger, NoLogger };`)
      .code(`\
/**
 * GENERAL INTERFACES
 */
export interface Typed<T> {
  get ${codegenSettings.getTypedAnchorName()}(): T;
}`)
      .merge(
        getEnvironmentCode(config),
        await (new UserCodeGenerator(config.user, config.settings).generate()),
      )
      .code(`\
export interface AmplitudeLoadOptions extends Partial<AmplitudeLoadOptionsCore> {
  environment?: Environment,
}`
      );
  }
}

export class AmplitudeBrowserCodeGenerator extends AmplitudeCoreCodeGenerator {
  async generate(config: AmplitudeConfigModel): Promise<CodeBlock> {
    const codegenSettings = new CodeGenerationSettings(config.settings);
    const typed = codegenSettings.getTypedAnchorName();

    const coreCode = await super.generate(config);

    return coreCode
      .import(`import { Amplitude as AmplitudeBrowser } from "@amplitude/amplitude-browser";`)
      .export(`export { MessageHub, hub } from "@amplitude/hub";`)
      .merge(
        await (new AnalyticsBrowserCodeGenerator(config.analytics, config.settings).generate()),
        await (new ExperimentBrowserCodeGenerator(config.experiments, config.settings).generate()),
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
  async generate(config: AmplitudeConfigModel): Promise<CodeBlock> {
    const codegenSettings = new CodeGenerationSettings(config.settings);
    const typed = codegenSettings.getTypedAnchorName();

    const coreCode = await super.generate(config);

    return coreCode
      .merge(
        await (new AnalyticsNodeCodeGenerator(config.analytics, config.settings).generate()),
        await (new ExperimentNodeCodeGenerator(config.experiments, config.settings).generate()),
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
