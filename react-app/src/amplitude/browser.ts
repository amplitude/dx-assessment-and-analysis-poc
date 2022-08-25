import { Amplitude as AmplitudeCore } from "../@amplitude/amplitude/browser";
import { Analytics as AnalyticsCore, Event } from "../@amplitude/analytics/browser";
import { Experiment as ExperimentCore } from "../@amplitude/experiment-browser";
import { AmplitudeLoadOptions } from "../@amplitude/amplitude/browser/client";
import { AMultiVariateExperiment, Typed, User, user, VariantMethods } from "./core";

export { User, user };

/**
 * AMPLITUDE
 */
export class Amplitude extends AmplitudeCore {
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
export class UserLoggedIn implements Event {
  event_type = 'User Logged In';
}

interface TrackingPlanMethods{
  userSignedUp(): void;
  userLoggedIn(): void;
  addToCart(): void;
  checkout(): void;
}

export class Analytics extends AnalyticsCore implements Typed<TrackingPlanMethods> {
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
export class Experiment extends ExperimentCore implements Typed<VariantMethods> {
  get data() {
    const core = this;
    return {
      flagCodegenEnabled() { return core.variant('flag-codegen-enabled') },
      aMultiVariateExperiment() { return core.variant('a-multi-variate-experiment') as AMultiVariateExperiment },
    };
  }
}

export const experiment = new Experiment();
