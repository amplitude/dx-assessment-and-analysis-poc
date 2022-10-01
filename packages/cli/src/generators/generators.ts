import { Config } from "../config";
import { getEnvironmentCode } from "./typescript/environment";

export interface CodeFile {
  path: string;
  code: string;
}

export interface CodeBlockModel {
  code: string;
  tag?: number;
}

export const CodeBlockTag = {
  None: 0,
  Export: 1,
  Import: 2,
};

function sortByCodeBlockTag(a: CodeBlockModel, b: CodeBlockModel) {
  return b.tag - a.tag;
}

export class CodeBlock {
  protected blocks: CodeBlockModel[];

  constructor(code?: string, tag = CodeBlockTag.None) {
    this.blocks = code ? [{ tag, code }] : [];
  }

  add(code: string, tag = CodeBlockTag.None): CodeBlock {
    this.blocks.push({tag, code});
    return this;
  }

  addAs(tag: number, code: string): CodeBlock {
    this.blocks.push({tag, code});
    return this;
  }

  merge(blocks: CodeBlock[]): CodeBlock {
    blocks.forEach(b => {
      this.blocks.push(...b.blocks);
    });
    return this;
  }

  toString() {
    return this.blocks.sort(sortByCodeBlockTag).map(b => b.code).join(`\n\n`);
  }
}

export interface CodeGenerator {
  generate(config: Config): CodeFile[];
}

// const coreAnalyticsCode: CodeBlock = {
//   imports: [
//     `import { AnalyticsEvent, IAnalyticsClient as IAnalyticsClientCore } from "@amplitude/analytics-core";`
//   ],
//   exports: [`export type { AnalyticsEvent };`],
//   codeBlocks: [
//     `\
// /**
//  * ANALYTICS
//  */
// export class UserLoggedIn implements AnalyticsEvent {
//   event_type = 'User Logged In';
// }
//
// export interface TrackingPlanMethods{
//   userSignedUp(): void;
//   userLoggedIn(): void;
//   addToCart(): void;
//   checkout(): void;
// }
//
// export interface IAnalyticsClient extends IAnalyticsClientCore, Typed<TrackingPlanMethods> {}`
//   ],
// }


function getAmplitudeCoreCode(config: Config): CodeBlock {
  return new CodeBlock()
    .addAs(CodeBlockTag.Import,`\
import { AmplitudeLoadOptions as AmplitudeLoadOptionsCore, Logger, NoLogger } from "@amplitude/amplitude-core";
import { User as UserCore } from "@amplitude/user";
import { AnalyticsEvent, IAnalyticsClient as IAnalyticsClientCore } from "@amplitude/analytics-core";
import { IExperimentClient as IExperimentClientCore } from "@amplitude/experiment-core";`)
    .addAs(CodeBlockTag.Export, `\
export type { AnalyticsEvent };
export { Logger, NoLogger };`)
    .add(`\
/**
 * GENERAL INTERFACES
 */
export interface Typed<T> {
  get typed(): T;
}`)
    .merge([getEnvironmentCode(config)])
    .add(`\
export interface AmplitudeLoadOptions extends Partial<AmplitudeLoadOptionsCore> {
  environment?: Environment,
}

/**
 * USER
 */
interface UserProperties {
  requiredProp: 'strongly typed';
}
interface TypedUserMethods {
  setUserProperties(properties: UserProperties): TypedUserMethods;
}

export class User extends UserCore implements Typed<TypedUserMethods> {
  get typed(): TypedUserMethods {
    const core = this;
    return {
      setUserProperties(properties) {
        core.setUserProperties(properties);
        return this;
      },
    };
  }
}

export const user = new User();

/**
 * ANALYTICS
 */
export class UserLoggedIn implements AnalyticsEvent {
  event_type = 'User Logged In';
}

export interface TrackingPlanMethods{
  userSignedUp(): void;
  userLoggedIn(): void;
  addToCart(): void;
  checkout(): void;
}

export interface IAnalyticsClient extends IAnalyticsClientCore, Typed<TrackingPlanMethods> {}

export class TrackingPlanClient implements TrackingPlanMethods {
  constructor(private analytics: IAnalyticsClientCore) {}
  userSignedUp() { this.analytics.track('User Signed Up') }
  userLoggedIn() { this.analytics.track('User Logged In') }
  addToCart() { this.analytics.track('Add To Cart') }
  checkout() { this.analytics.track('Checkout') }
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
`);
}

function getAmplitudeBrowserCode(config: Config): CodeBlock {
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

  get typed() {
    const core = this;
    return {
      load(config: AmplitudeLoadOptions) {
        const environment = config.environment ?? 'development';
        const apiKey = config.apiKey ?? ApiKey[environment];

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
  get typed(): TrackingPlanMethods {
    return new TrackingPlanClient(this);
  }
}

export const analytics = new Analytics();
export const typedAnalytics = analytics.typed;
/**
 * EXPERIMENT
 */
// Example of experiment codegen
// https://github.com/amplitude/ampli-examples/pull/109/files#diff-1487646f6355cf6800e238dd89bfe453388e4cd1ceec34980e3418e570c1bb2b
export class Experiment extends ExperimentBrowser implements IExperimentClient {
  get typed() {
    const core = this;
    return {
      flagCodegenEnabled() { return core.variant('flag-codegen-enabled') },
      aMultiVariateExperiment() { return core.variant('a-multi-variate-experiment') as AMultiVariateExperiment },
    };
  }
}

export const experiment = new Experiment();`);
}

export class AmplitudeGeneratorBrowser implements CodeGenerator {
  generate(config: Config): CodeFile[] {
    return [{
      path: 'index.ts',
      code: getAmplitudeCoreCode(config).merge([getAmplitudeBrowserCode(config)]).toString(),
    }];
  }
}

function getAmplitudeNodeCode(): CodeBlock {
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
  get typed() {
    const core = this;
    return {
      load(config: AmplitudeLoadOptions) {
        const environment = config.environment ?? 'development';
        const apiKey = config.apiKey ?? ApiKey[environment];

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
  get typed() {
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
  get typed() {
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

export class AmplitudeGeneratorNode implements CodeGenerator {
  generate(config: Config): CodeFile[] {
    return [{
      path: 'index.ts',
      code: getAmplitudeCoreCode(config).merge([getAmplitudeNodeCode()]).toString(),
    }];
  }
}
