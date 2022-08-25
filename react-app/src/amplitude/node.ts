import { Amplitude as AmplitudeCore } from "../@amplitude/amplitude/browser";
import { Analytics as AnalyticsCore, AnalyticsClient as AnalyticsClientCore, Event } from "../@amplitude/analytics/node";
// import { Experiment as ExperimentCore } from "../@amplitude/experiment-browser";
import { AmplitudeLoadOptions } from "../@amplitude/amplitude/browser/client";
import { TrackingPlanMethods, User, user, UserLoggedIn, } from "./core";
import { IUser } from "../@amplitude/amplitude/core/user";

export { User, user, UserLoggedIn };
export type { TrackingPlanMethods } from './core';

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
    // this.addPlugin(experiment);
  }
}

export const amplitude = new Amplitude();

export class AnalyticsClient extends AnalyticsClientCore {
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

export class Analytics extends AnalyticsCore {
  user(user: IUser): AnalyticsClient {
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
// export class Experiment extends ExperimentCore implements Typed<VariantMethods> {
//   get data() {
//     const core = this;
//     return {
//       flagCodegenEnabled() { return core.variant('flag-codegen-enabled') },
//       aMultiVariateExperiment() { return core.variant('a-multi-variate-experiment') as AMultiVariateExperiment },
//     };
//   }
// }
//
// export const experiment = new Experiment();
