import { AmplitudeConfigModel, CodeGenerationSettings, CodeGenerationSettingsModel } from "../config";
import { getEnvironmentCode } from "./typescript/environment";
import { UserCodeGenerator } from "./typescript/user";
import { AnalyticsCoreCodeGenerator } from "./typescript/analytics";
import { CodeBlock, CodeExporter, CodeFile, CodeGenerator } from "./code-generator";
import {
  ExperimentBrowserCodeGenerator,
  ExperimentNodeCodeGenerator
} from "./typescript/experiment";

async function getAmplitudeCoreCode(config: AmplitudeConfigModel): Promise<CodeBlock> {
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
      await (new AnalyticsCoreCodeGenerator(config.analytics).generate()),
    )
    .code(`\
export interface AmplitudeLoadOptions extends Partial<AmplitudeLoadOptionsCore> {
  environment?: Environment,
}`
    );
}

async function getAmplitudeBrowserCode(config: AmplitudeConfigModel): Promise<CodeBlock> {
  const codegenSettings = new CodeGenerationSettings(config.settings);
  const typed = codegenSettings.getTypedAnchorName();

  return new CodeBlock()
    .import(`\
import { Amplitude as AmplitudeBrowser } from "@amplitude/amplitude-browser";
import { Analytics as AnalyticsBrowser } from "@amplitude/analytics-browser";
import { Experiment as ExperimentBrowser } from "@amplitude/experiment-browser";`)
    .export(`export { MessageHub, hub } from "@amplitude/hub";`)
    .merge(
      await (new ExperimentBrowserCodeGenerator(config.experiments, config.settings).generate()),
    )
    .code(`\
/**
 * ANALYTICS
 */
export class Analytics extends AnalyticsBrowser implements IAnalyticsClient {
  get ${typed}(): TrackingPlanMethods {
    return new TrackingPlanClient(this);
  }
}

export const analytics = new Analytics();
export const typedAnalytics = analytics.${typed};

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

export const amplitude = new Amplitude();
`);
}

export class AmplitudeGeneratorBrowser implements CodeGenerator<AmplitudeConfigModel> {
  async generate(config: AmplitudeConfigModel): Promise<CodeBlock> {
    return (await getAmplitudeCoreCode(config)).merge(await getAmplitudeBrowserCode(config));
  }
}

function getAmplitudeNodeCode(settings: CodeGenerationSettingsModel): CodeBlock {
  const codegenSettings = new CodeGenerationSettings(settings);
  const typed = codegenSettings.getTypedAnchorName();

  return CodeBlock.import(`\
import { Amplitude as AmplitudeNode } from "@amplitude/amplitude-node";
import {
  Analytics as AnalyticsNode,
  AnalyticsClient as AnalyticsClientNode
} from "@amplitude/analytics-node";
import {
  Experiment as ExperimentNode,
  ExperimentClient as ExperimentClientNode
} from "@amplitude/experiment-node";`)
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

export const amplitude = new Amplitude();

/**
 * ANALYTICS
 */
export class AnalyticsClient extends AnalyticsClientNode implements IAnalyticsClient {
  get ${typed}() {
    return new TrackingPlanClient(this);;
  }
}

export class Analytics extends AnalyticsNode {
  user(user: User): AnalyticsClient {
    return new AnalyticsClient(user, this.config);
  }

  userId(userId: string): AnalyticsClient {
    return this.user(new User(userId));
  }

  deviceId(deviceId: string): AnalyticsClient {
    return this.user(new User(undefined, deviceId));
  }
}

export const analytics = new Analytics();`);
}

export class AmplitudeGeneratorNode implements CodeGenerator<AmplitudeConfigModel> {
  async generate(config: AmplitudeConfigModel): Promise<CodeBlock> {
    return (await getAmplitudeCoreCode(config)).merge(
      await (new ExperimentNodeCodeGenerator(config.experiments, config.settings).generate()),
      await getAmplitudeNodeCode(config.settings)
    );
  }
}

export class TypeScriptExporter implements CodeExporter {
  async export(codeBlock: CodeBlock): Promise<CodeFile[]> {
    return [{
      path: 'index.ts',
      code: codeBlock.toString(),
    }];
  }
}
