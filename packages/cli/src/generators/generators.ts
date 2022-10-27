import { AmplitudeConfigModel, CodeGenerationSettings, CodeGenerationSettingsModel } from "../config";
import { getEnvironmentCode } from "./typescript/environment";
import { UserCodeGenerator } from "./typescript/user";
import { AnalyticsCoreCodeGenerator } from "./typescript/analytics";
import { CodeBlock, CodeBlockTag, CodeExporter, CodeFile, CodeGenerator } from "./code-generator";

async function getAmplitudeCoreCode(config: AmplitudeConfigModel): Promise<CodeBlock> {
  const codegenSettings = new CodeGenerationSettings(config.settings);

  return new CodeBlock()
    .addAs(CodeBlockTag.Import,`\
import { AmplitudeLoadOptions as AmplitudeLoadOptionsCore, Logger, NoLogger } from "@amplitude/amplitude-core";
import { IExperimentClient as IExperimentClientCore } from "@amplitude/experiment-core";`)
    .addAs(CodeBlockTag.Export, `export { Logger, NoLogger };`)
    .add(`\
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
    .add(`\
export interface AmplitudeLoadOptions extends Partial<AmplitudeLoadOptionsCore> {
  environment?: Environment,
}

/**
 * EXPERIMENT
 */
export type AMultiVariateExperiment = { control?: any, treatment?: any };

export interface VariantMethods {
  flagCodegenEnabled(): boolean;
  aMultiVariateExperiment(): AMultiVariateExperiment
}

export interface IExperimentClient extends IExperimentClientCore, Typed<VariantMethods> {}
`
    );
}

async function getAmplitudeBrowserCode(config: AmplitudeConfigModel): Promise<CodeBlock> {
  const codegenSettings = new CodeGenerationSettings(config.settings);

  return new CodeBlock()
    .addAs(CodeBlockTag.Import, `\
import { Amplitude as AmplitudeBrowser } from "@amplitude/amplitude-browser";
import { Analytics as AnalyticsBrowser } from "@amplitude/analytics-browser";
import { Experiment as ExperimentBrowser } from "@amplitude/experiment-browser";`)
    .addAs(CodeBlockTag.Export, `export { MessageHub, hub } from "@amplitude/hub";`)
    .add(`\
/**
 * AMPLITUDE
 */
export class Amplitude extends AmplitudeBrowser {
  constructor(_user?: User) {
    super(_user ?? user)
  }

  get ${codegenSettings.getTypedAnchorName()}() {
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

/**
 * ANALYTICS
 */
export class Analytics extends AnalyticsBrowser implements IAnalyticsClient {
  get ${codegenSettings.getTypedAnchorName()}(): TrackingPlanMethods {
    return new TrackingPlanClient(this);
  }
}

export const analytics = new Analytics();
export const typedAnalytics = analytics.${config.settings.typedAnchorName || 'typed'};
/**
 * EXPERIMENT
 */
// Example of experiment codegen
// https://github.com/amplitude/ampli-examples/pull/109/files#diff-1487646f6355cf6800e238dd89bfe453388e4cd1ceec34980e3418e570c1bb2b
export class Experiment extends ExperimentBrowser implements IExperimentClient {
  get ${codegenSettings.getTypedAnchorName()}() {
    const core = this;
    return {
      flagCodegenEnabled() { return core.variant('flag-codegen-enabled') },
      aMultiVariateExperiment() { return core.variant('a-multi-variate-experiment') as AMultiVariateExperiment },
    };
  }
}

export const experiment = new Experiment();`);
}

export class AmplitudeGeneratorBrowser implements CodeGenerator<AmplitudeConfigModel> {
  async generate(config: AmplitudeConfigModel): Promise<CodeBlock> {
    return (await getAmplitudeCoreCode(config)).merge(await getAmplitudeBrowserCode(config));
  }
}

function getAmplitudeNodeCode(settings: CodeGenerationSettingsModel): CodeBlock {
  const codegenSettings = new CodeGenerationSettings(settings);

  return new CodeBlock()
    .addAs(CodeBlockTag.Import, `\
import { Amplitude as AmplitudeNode } from "@amplitude/amplitude-node";
import {
  Analytics as AnalyticsNode,
  AnalyticsClient as AnalyticsClientNode
} from "@amplitude/analytics-node";
import {
  Experiment as ExperimentNode,
  ExperimentClient as ExperimentClientNode
} from "@amplitude/experiment-node";`)
    .add(`\
/**
 * AMPLITUDE
 */
export class Amplitude extends AmplitudeNode {
  get ${codegenSettings.getTypedAnchorName()}() {
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
  get ${codegenSettings.getTypedAnchorName()}() {
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

export const analytics = new Analytics();

/**
 * EXPERIMENT
 */

// Example of experiment codegen
// https://github.com/amplitude/ampli-examples/pull/109/files#diff-1487646f6355cf6800e238dd89bfe453388e4cd1ceec34980e3418e570c1bb2b
export class ExperimentClient extends ExperimentClientNode implements Typed<VariantMethods> {
  get ${codegenSettings.getTypedAnchorName()}() {
    const core = this;
    return {
      flagCodegenEnabled() { return core.variant('flag-codegen-enabled') },
      aMultiVariateExperiment() { return core.variant('a-multi-variate-experiment') as AMultiVariateExperiment },
    };
  }
}

export class Experiment extends ExperimentNode {
  user(user: User): ExperimentClient {
    return new ExperimentClient(user, this.config, this);
  }

  userId(userId: string): ExperimentClient {
    return this.user(new User(userId));
  }

  deviceId(deviceId: string): ExperimentClient {
    return this.user(new User(undefined, deviceId));
  }
}

export const experiment = new Experiment();`);
}

export class AmplitudeGeneratorNode implements CodeGenerator<AmplitudeConfigModel> {
  async generate(config: AmplitudeConfigModel): Promise<CodeBlock> {
    return (await getAmplitudeCoreCode(config)).merge(await getAmplitudeNodeCode(config.settings));
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
