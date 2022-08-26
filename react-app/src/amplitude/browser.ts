import { Amplitude as AmplitudeBrowser } from "../@amplitude/amplitude/browser";
import { Analytics as AnalyticsBrowser } from "../@amplitude/analytics/browser";
import { Experiment as ExperimentBrowser } from "../@amplitude/experiment/browser";
import { AmplitudeLoadOptions } from "../@amplitude/amplitude/core/client";
import {
  AMultiVariateExperiment,
  IAnalyticsClient,
  IExperimentClient,
  User,
  user,
  VariantMethods,
  TrackingPlanMethods,
  Event,
} from "./core";

export { User, user };
export type { Event, IAnalyticsClient, IExperimentClient, TrackingPlanMethods, VariantMethods };

/**
 * AMPLITUDE
 */
export class Amplitude extends AmplitudeBrowser {
  constructor() {
    super(user)
  }

  load(config: AmplitudeLoadOptions) {
    super.load(config);
    this.addPlugin(analytics);
    this.addPlugin(experiment);
  }

  get user(): User {
    return this._user as User;
  }
}

export const amplitude = new Amplitude();

/**
 * ANALYTICS
 */
export class Analytics extends AnalyticsBrowser implements IAnalyticsClient {
  get data() {
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
  get data() {
    const core = this;
    return {
      flagCodegenEnabled() { return core.variant('flag-codegen-enabled') },
      aMultiVariateExperiment() { return core.variant('a-multi-variate-experiment') as AMultiVariateExperiment },
    };
  }
}

export const experiment = new Experiment();
