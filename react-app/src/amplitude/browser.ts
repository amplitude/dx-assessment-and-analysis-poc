import { Amplitude as AmplitudeBrowser } from "../@amplitude/amplitude/browser";
import { Analytics as AnalyticsBrowser } from "../@amplitude/analytics/browser";
import { Experiment as ExperimentBrowser } from "../@amplitude/experiment/browser";
import { MessageHub, hub } from "../@amplitude/hub";
import {
  AMultiVariateExperiment,
  IAnalyticsClient,
  IExperimentClient,
  User,
  user,
  VariantMethods,
  TrackingPlanMethods,
  AnalyticsEvent,
  UserLoggedIn,
  AmplitudeLoadOptions,
  ApiKey,
  Logger,
  NoLogger,
} from "./core";

export { User, user, UserLoggedIn, MessageHub, hub, Logger, NoLogger };
export type {
  AmplitudeLoadOptions,
  AnalyticsEvent,
  IAnalyticsClient,
  IExperimentClient,
  TrackingPlanMethods,
  VariantMethods
};

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
  get typed() {
    const core = this;
    return {
      userSignedUp() { core.track('User Signed Up') },
      userLoggedIn() { core.track('User Logged In') },
      addToCart() { core.track('Add To Cart') },
      checkout() { core.track('Checkout') },
    };
  }
}

export const analytics = new Analytics();

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
