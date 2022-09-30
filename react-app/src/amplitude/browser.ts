import { AmplitudeLoadOptions as AmplitudeLoadOptionsCore, Logger, NoLogger } from "@amplitude/amplitude-core";
import { User as UserCore } from "@amplitude/user";
import { AnalyticsEvent, IAnalyticsClient as IAnalyticsClientCore } from "@amplitude/analytics-core";
import { IExperimentClient as IExperimentClientCore } from "@amplitude/experiment-core";

import {
  Amplitude as AmplitudeBrowser,
} from "@amplitude/amplitude-browser";
import {
  Analytics as AnalyticsBrowser,
  IAnalyticsClient as IAnalyticsClientBrowser,
} from "@amplitude/analytics-browser";
import { Experiment as ExperimentBrowser } from "@amplitude/experiment-browser";

export type { AnalyticsEvent };
export { Logger, NoLogger };

export { MessageHub, hub } from "@amplitude/hub";

/**
 * GENERAL INTERFACES
 */
export interface Typed<T> {
  get typed(): T;
}

/**
 * ENVIRONMENT
 */
export type Environment = 'development' | 'production' | 'test';

export const ApiKey: Record<Environment, string> = {
  development: 'dev-api-key',
  production: 'prod-api-key',
  test: 'test-api-key'
};

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

/**
 * EXPERIMENT
 */
export type AMultiVariateExperiment = { control?: any, treatment?: any };

export interface VariantMethods {
  flagCodegenEnabled(): boolean;
  aMultiVariateExperiment(): AMultiVariateExperiment
}

export interface IExperimentClient extends IExperimentClientCore, Typed<VariantMethods> {}


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
export class TrackingPlanClient implements TrackingPlanMethods {
  constructor(private analytics: IAnalyticsClientBrowser) {}
  userSignedUp() { this.analytics.track('User Signed Up') }
  userLoggedIn() { this.analytics.track('User Logged In') }
  addToCart() { this.analytics.track('Add To Cart') }
  checkout() { this.analytics.track('Checkout') }
}

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

export const experiment = new Experiment();