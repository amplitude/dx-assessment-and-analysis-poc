/* tslint:disable */
/* eslint-disable */
/**
 * This file is generated by Amplitude.
 *
 * DO NOT MODIFY BY HAND
 *
 * To update run 'amplitude-cli pull'
 */

import { AmplitudeLoadOptions as AmplitudeLoadOptionsCore, Logger, NoLogger } from "@amplitude/amplitude-core";
import { User as UserCore } from "@amplitude/user";
import { AnalyticsEvent, IAnalyticsClient as IAnalyticsClientCore } from "@amplitude/analytics-core";
import {
  Analytics as AnalyticsNode,
  AnalyticsClient as AnalyticsClientNode
} from "@amplitude/analytics-node";
import {
  Experiment as ExperimentNode,
  ExperimentClient as ExperimentClientNode,
  IExperimentClient as IExperimentClientCore,
} from "@amplitude/experiment-node";
import { Amplitude as AmplitudeNode } from "@amplitude/amplitude-node";

export { Logger, NoLogger };
export { MessageHub, hub } from "@amplitude/hub";
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

export interface AmplitudeLoadOptions extends Partial<AmplitudeLoadOptionsCore> {
  environment?: Environment,
}

/**
 * ANALYTICS
 */

/**
 * An Event with Array props
 */
export interface EventWithArrayProperties {
  arrayProp?: string[];
}


/**
 * A song was added to a user's favorites
 */
export interface SongFavoritedProperties {
  /**
   * The song unique identifier
   */
  songId: string;
  /**
   * An optional value
   */
  optionalProp?: string;
}


/**
 * A song was played
 */
export interface SongPlayedProperties {
  /**
   * The song unique identifier
   */
  songId: string;
  /**
   * If the song is a favorite
   */
  songFavorited?: boolean;
}


/**
 * The user logged in
 */
export interface UserLoggedInProperties {
  method: "email" | "facebook" | "google";
}


/**
 * A user signed up
 */
export interface UserSignedUpProperties {
  /**
   * How the user was brought to the app
   */
  referralSource?: "facebook" | "twitter" | "other";
}



export class AddToCart implements AnalyticsEvent {
  event_type = 'Add To Cart';
}

export class Checkout implements AnalyticsEvent {
  event_type = 'Checkout';
}

export class EventWithArray implements AnalyticsEvent {
  event_type = 'Event With Array';

  constructor(
    public event_properties?: EventWithArrayProperties,
  ) {
    this.event_properties = event_properties;
  }
}

export class EventWithConst implements AnalyticsEvent {
  event_type = 'Event With Const';
  event_properties = {
    'constProp': true,
  };
}

export class SongFavorited implements AnalyticsEvent {
  event_type = 'Song Favorited';
  event_properties: SongFavoritedProperties & {
    'aConstant': true;
  };

  constructor(
    event_properties: SongFavoritedProperties,
  ) {
    this.event_properties = {
      ...event_properties,
      'aConstant': true,
    };
  }
}

export class SongPlayed implements AnalyticsEvent {
  event_type = 'Song Played';

  constructor(
    public event_properties: SongPlayedProperties,
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

export class UserSignedUp implements AnalyticsEvent {
  event_type = 'User Signed Up';

  constructor(
    public event_properties?: UserSignedUpProperties,
  ) {
    this.event_properties = event_properties;
  }
}


export interface TrackingPlanMethods{
  addToCart(): Promise<void>;
  checkout(): Promise<void>;
  eventWithArray(properties?: EventWithArrayProperties): Promise<void>;
  eventWithConst(): Promise<void>;
  songFavorited(properties: SongFavoritedProperties): Promise<void>;
  songPlayed(properties: SongPlayedProperties): Promise<void>;
  userLoggedIn(properties: UserLoggedInProperties): Promise<void>;
  userSignedUp(properties?: UserSignedUpProperties): Promise<void>;
}

export interface IAnalyticsClient extends IAnalyticsClientCore, Typed<TrackingPlanMethods> {}

export class TrackingPlanClient implements TrackingPlanMethods {
  constructor(private analytics: IAnalyticsClientCore) {}
  async addToCart() {
    return this.analytics.track(new AddToCart())
  }
  async checkout() {
    return this.analytics.track(new Checkout())
  }
  async eventWithArray(properties?: EventWithArrayProperties) {
    return this.analytics.track(new EventWithArray(properties))
  }
  async eventWithConst() {
    return this.analytics.track(new EventWithConst())
  }
  async songFavorited(properties: SongFavoritedProperties) {
    return this.analytics.track(new SongFavorited(properties))
  }
  async songPlayed(properties: SongPlayedProperties) {
    return this.analytics.track(new SongPlayed(properties))
  }
  async userLoggedIn(properties: UserLoggedInProperties) {
    return this.analytics.track(new UserLoggedIn(properties))
  }
  async userSignedUp(properties?: UserSignedUpProperties) {
    return this.analytics.track(new UserSignedUp(properties))
  }
}

export class AnalyticsClient extends AnalyticsClientNode implements IAnalyticsClient {
  get typed() {
    return new TrackingPlanClient(this);;
  }
}

export class Analytics extends AnalyticsNode {
  user(user: User): AnalyticsClient {
    return new AnalyticsClient(user, this.config, this, this.client);
  }

  userId(userId: string): AnalyticsClient {
    return this.user(new User(userId));
  }

  deviceId(deviceId: string): AnalyticsClient {
    return this.user(new User(undefined, deviceId));
  }
}

export const analytics = new Analytics();


export type BaseExperiment = {
  key: string;
  name: string;
}

/* A Multi Variate Experiment */
export namespace AMultiVariateExperimentVariants {
  export type Generic = { key: 'generic', payload: any };
  export type Ampli = { key: 'ampli', payload: any };

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
  constructor(private client: IExperimentClientCore) {}

  private getTypedVariant<T extends BaseExperiment>(exp: T) {
    const variant = this.client.variant(exp.key);
    if (typeof variant === 'string') {
      // FIXME: how to handle string responses?
      // (exp as any)[variant.value] = { payload: variant.payload };
      // (exp as any)['variant'] = { key: variant.value, payload: variant.payload };
    } else {
      if (variant && variant.value) {
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

export interface IExperimentClient extends IExperimentClientCore, Typed<VariantMethods> {}

export class ExperimentClient extends ExperimentClientNode implements IExperimentClient {
  get typed() {
    return new VariantMethodsClient(this);
  }
}

export class Experiment extends ExperimentNode {
  user(user: User): ExperimentClient {
    return new ExperimentClient(user, this.config, this, this.client);
  }

  userId(userId: string): ExperimentClient {
    return this.user(new User(userId));
  }

  deviceId(deviceId: string): ExperimentClient {
    return this.user(new User(undefined, deviceId));
  }
}

export const experiment = new Experiment();

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
          // Set per-product ApiKeys
          configuration: {
            analytics: {
              apiKey:  ApiKey['analytics'][environment],
            },
            experiment: {
              apiKey:  ApiKey['experiment'][environment],
            }
          },
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