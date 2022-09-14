import { Amplitude as AmplitudeNode } from "../@amplitude/amplitude/node";
import {
  Analytics as AnalyticsNode,
  AnalyticsClient as AnalyticsClientNode
} from "../@amplitude/analytics/node";
import {
  Experiment as ExperimentNode,
  ExperimentClient as ExperimentClientNode
} from "../@amplitude/experiment/node";
import {
  AMultiVariateExperiment,
  IAnalyticsClient,
  IExperimentClient,
  TrackingPlanMethods,
  Typed,
  User,
  UserLoggedIn,
  VariantMethods,
  AnalyticsEvent,
  AmplitudeLoadOptions,
  ApiKey,
  Logger,
  NoLogger,
} from "./core";
import { IUser } from "../@amplitude/amplitude/core/user";

export { User, UserLoggedIn, Logger, NoLogger };
export type { AnalyticsEvent, IAnalyticsClient, IExperimentClient, TrackingPlanMethods, VariantMethods };

/**
 * AMPLITUDE
 */
export class Amplitude extends AmplitudeNode {
  get data() {
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
  get data() {
    const core = this;
    return {
      userSignedUp() { core.track('User Signed Up') },
      userLoggedIn() { core.track(new UserLoggedIn()) },
      addToCart() { core.track('Add To Cart') },
      checkout() { core.track('Checkout') },
    };
  }
}

export class Analytics extends AnalyticsNode {
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
export class ExperimentClient extends ExperimentClientNode implements Typed<VariantMethods> {
  get data() {
    const core = this;
    return {
      flagCodegenEnabled() { return core.variant('flag-codegen-enabled') },
      aMultiVariateExperiment() { return core.variant('a-multi-variate-experiment') as AMultiVariateExperiment },
    };
  }
}

export class Experiment extends ExperimentNode {
  user(user: IUser): ExperimentClient {
    return new ExperimentClient(user, this.config, this);
  }

  userId(userId: string): ExperimentClient {
    return this.user(new User(userId));
  }

  deviceId(deviceId: string): ExperimentClient {
    return this.user(new User(undefined, deviceId));
  }
}

export const experiment = new Experiment();
