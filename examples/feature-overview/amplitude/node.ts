import { AmplitudeLoadOptions as AmplitudeLoadOptionsCore, Logger, NoLogger } from "@amplitude/amplitude-core";
import { User as UserCore } from "@amplitude/user";
import { AnalyticsEvent, IAnalyticsClient as IAnalyticsClientCore } from "@amplitude/analytics-core";
import { IExperimentClient as IExperimentClientNode } from "@amplitude/experiment-node";
import { Amplitude as AmplitudeNode } from "@amplitude/amplitude-node";
import {
  Analytics as AnalyticsNode,
  AnalyticsClient as AnalyticsClientNode
} from "@amplitude/analytics-node";
import {
  Experiment as ExperimentNode,
  ExperimentClient as ExperimentClientNode
} from "@amplitude/experiment-node";

export { Logger, NoLogger };
export type { AnalyticsEvent };

/**
 * GENERAL INTERFACES
 */
export interface Typed<T> {
  get typed(): T;
}

/**
 * ENVIRONMENT
 */
export type Environment = 'development' | 'production';

export const ApiKey: Record<string, Record<Environment, string>> = {
  analytics: {
    development: 'my-api-key',
    production: 'my-api-key'
  },
  experiment: {
    development: 'my-deployment-key',
    production: 'my-deployment-key'
  }
};

/**
 * USER
 */

/**
 * Collection of user properties
 */
export interface UserProperties {
  /**
   * How the user was brought to the app
   */
  referralSource: "facebook" | "twitter" | "other";
  /**
   * Total number of favorited songs
   */
  favoriteSongCount?: number;
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

/**
 * A user signed up
 */
export interface UserSignedUpProperties {
  /**
   * How the user was brought to the app
   */
  referralSource?: "facebook" | "twitter" | "other";
}


/**
 * The user logged in
 */
export interface UserLoggedInProperties {
  /**
   * The song unique identifier
   */
  method: "email" | "facebook" | "google";
}



export class UserSignedUp implements AnalyticsEvent {
  event_type = 'User Signed Up';

  constructor(
    public event_properties?: UserSignedUpProperties,
  ) {
    this.event_properties = event_properties;
  }
}

export class UserLoggedIn implements AnalyticsEvent {
  event_type = 'User Logged In';

  constructor(
    public event_properties: UserLoggedInProperties,
  ) {
    this.event_properties = event_properties;
  }
}

export class AddToCart implements AnalyticsEvent {
  event_type = 'Add To Cart';
}

export class Checkout implements AnalyticsEvent {
  event_type = 'Checkout';
}


export interface TrackingPlanMethods{
  userSignedUp(properties?: UserSignedUpProperties): void;
  userLoggedIn(properties: UserLoggedInProperties): void;
  addToCart(): void;
  checkout(): void;
}

export interface IAnalyticsClient extends IAnalyticsClientCore, Typed<TrackingPlanMethods> {}

export class TrackingPlanClient implements TrackingPlanMethods {
  constructor(private analytics: IAnalyticsClientCore) {}
  userSignedUp(properties?: UserSignedUpProperties) {
    this.analytics.track(new UserSignedUp(properties))
  }
  userLoggedIn(properties: UserLoggedInProperties) {
    this.analytics.track(new UserLoggedIn(properties))
  }
  addToCart() {
    this.analytics.track(new AddToCart())
  }
  checkout() {
    this.analytics.track(new Checkout())
  }
}

export type BaseExperiment = {
  key: string;
  name: string;
}

/* A Multi Variate Experiment */
export namespace AMultiVariateExperimentVariants {
  export type Generic = { key: 'generic', payload: string[] };
  export type Ampli = { key: 'ampli', payload: string[] };

  export enum Keys {
    Generic = 'generic',
    Ampli = 'ampli'
  }
}
export type AMultiVariateExperimentType = BaseExperiment & {
  generic?: AMultiVariateExperimentVariants.Generic;
  ampli?: AMultiVariateExperimentVariants.Ampli;
}
export class AMultiVariateExperiment implements AMultiVariateExperimentType {
  key = 'a-multi-variate-experiment';
  name = "A Multi Variate Experiment";
  variant: AMultiVariateExperimentVariants.Generic |AMultiVariateExperimentVariants.Ampli | undefined;

  constructor(
    public generic?: AMultiVariateExperimentVariants.Generic,
    public ampli?: AMultiVariateExperimentVariants.Ampli,
  ) {}
}
export namespace AMultiVariateExperiment {
  export const Key = 'a-multi-variate-experiment';
  export const Name = "A Multi Variate Experiment";

  export enum Variants {
    Generic = 'generic',
    Ampli = 'ampli'
  }
}

/* Flag Codegen Enabled */
export namespace FlagCodegenEnabledVariants {
  export type On = { key: 'on', payload: any };

  export enum Keys {
    On = 'on'
  }
}
export type FlagCodegenEnabledType = BaseExperiment & {
  on?: FlagCodegenEnabledVariants.On;
}
export class FlagCodegenEnabled implements FlagCodegenEnabledType {
  key = 'flag-codegen-enabled';
  name = "Flag Codegen Enabled";
  variant: FlagCodegenEnabledVariants.On | undefined;

  constructor(
    public on?: FlagCodegenEnabledVariants.On,
  ) {}
}
export namespace FlagCodegenEnabled {
  export const Key = 'flag-codegen-enabled';
  export const Name = "Flag Codegen Enabled";

  export enum Variants {
    On = 'on'
  }
}
export interface VariantMethods {
  aMultiVariateExperiment(): AMultiVariateExperiment;
  flagCodegenEnabled(): FlagCodegenEnabled;
}

export class VariantMethodsClient implements VariantMethods {
  constructor(private client: IExperimentClientNode) {}

  private getTypedVariant<T extends BaseExperiment>(exp: T) {
    const variant = this.client.variant(exp.key);
    if (typeof variant === 'string') {
      // FIXME: how to handle string responses?
      // (exp as any)[variant.value] = { payload: variant.payload };
      // (exp as any)['variant'] = { key: variant.value, payload: variant.payload };
    } else {
      if (variant.value) {
        (exp as any)[variant.value] = { payload: variant.payload };
        (exp as any)['variant'] = { key: variant.value, payload: variant.payload };
      }
    }
    return exp;
  }

  aMultiVariateExperiment(): AMultiVariateExperiment {
    return this.getTypedVariant(new AMultiVariateExperiment());
  }

  flagCodegenEnabled(): FlagCodegenEnabled {
    return this.getTypedVariant(new FlagCodegenEnabled());
  }
}

export interface IExperimentClient extends IExperimentClientNode, Typed<VariantMethods> {}

export class ExperimentClient extends ExperimentClientNode implements IExperimentClient {
  get typed() {
    return new VariantMethodsClient(this);
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

export const experiment = new Experiment();

export interface AmplitudeLoadOptions extends Partial<AmplitudeLoadOptionsCore> {
  environment?: Environment,
}

/**
 * AMPLITUDE
 */
export class Amplitude extends AmplitudeNode {
  get typed() {
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
