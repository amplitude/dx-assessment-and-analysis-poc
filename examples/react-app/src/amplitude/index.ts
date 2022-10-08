import { AmplitudeLoadOptions as AmplitudeLoadOptionsCore, Logger, NoLogger } from "@amplitude/amplitude-core";
import { IExperimentClient as IExperimentClientCore } from "@amplitude/experiment-core";
import { User as UserCore } from "@amplitude/user";
import { AnalyticsEvent, IAnalyticsClient as IAnalyticsClientCore } from "@amplitude/analytics-core";
import { Amplitude as AmplitudeBrowser } from "@amplitude/amplitude-browser";
import { Analytics as AnalyticsBrowser } from "@amplitude/analytics-browser";
import { Experiment as ExperimentBrowser } from "@amplitude/experiment-browser";

export { Logger, NoLogger };
export type { AnalyticsEvent };
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
 * The user logged in
 */
export interface UserLoggedInProperties {
  /**
   * The song unique identifier
   */
  method: "email" | "facebook" | "google";
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
 * A song was added to a user's favorites
 */
export interface SongFavoritedProperties {
  /**
   * The unique identifier for a song
   */
  songId: number;
}


export class UserSignedUp implements AnalyticsEvent {
  event_type = 'User Signed Up';
}


export class UserLoggedIn implements AnalyticsEvent {
  event_type = 'User Logged In';
  constructor(public event_properties: UserLoggedInProperties) {}
}


export class SongPlayed implements AnalyticsEvent {
  event_type = 'Song Played';
  constructor(public event_properties: SongPlayedProperties) {}
}


export class SongFavorited implements AnalyticsEvent {
  event_type = 'Song Favorited';
  constructor(public event_properties: SongFavoritedProperties) {}
}


export class AddToCart implements AnalyticsEvent {
  event_type = 'Add To Cart';
}


export class Checkout implements AnalyticsEvent {
  event_type = 'Checkout';
}


export class EventWithConst implements AnalyticsEvent {
  event_type = 'Event With Const';
}


export interface TrackingPlanMethods{
  userSignedUp(): void;
  userLoggedIn(properties: UserLoggedInProperties): void;
  songPlayed(properties: SongPlayedProperties): void;
  songFavorited(properties: SongFavoritedProperties): void;
  addToCart(): void;
  checkout(): void;
  eventWithConst(): void;
}

export interface IAnalyticsClient extends IAnalyticsClientCore, Typed<TrackingPlanMethods> {}

export class TrackingPlanClient implements TrackingPlanMethods {
  constructor(private analytics: IAnalyticsClientCore) {}
  userSignedUp() {
    this.analytics.track(new UserSignedUp())
  }
  userLoggedIn(properties: UserLoggedInProperties) {
    this.analytics.track(new UserLoggedIn(properties))
  }
  songPlayed(properties: SongPlayedProperties) {
    this.analytics.track(new SongPlayed(properties))
  }
  songFavorited(properties: SongFavoritedProperties) {
    this.analytics.track(new SongFavorited(properties))
  }
  addToCart() {
    this.analytics.track(new AddToCart())
  }
  checkout() {
    this.analytics.track(new Checkout())
  }
  eventWithConst() {
    this.analytics.track(new EventWithConst())
  }
}

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