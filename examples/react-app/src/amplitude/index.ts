import { AmplitudeLoadOptions as AmplitudeLoadOptionsCore, Logger, NoLogger } from "@amplitude/amplitude-core";
import { User as UserCore } from "@amplitude/user";
import { AnalyticsEvent, IAnalyticsClient as IAnalyticsClientCore } from "@amplitude/analytics-core";
import { Amplitude as AmplitudeBrowser } from "@amplitude/amplitude-browser";
import { Analytics as AnalyticsBrowser } from "@amplitude/analytics-browser";
import { Experiment as ExperimentBrowser } from "@amplitude/experiment-browser";
import { IExperimentClient as IExperimentClientCore } from "@amplitude/experiment-core";

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
   * The song unique identifier
   */
  songId: string;
  /**
   * An optional value
   */
  optionalProp?: string;
}


/**
 * An Event with Array props
 */
export interface EventWithArrayProperties {
  /**
   * An array of strings
   */
  arrayProp?: string[];
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

export class SongPlayed implements AnalyticsEvent {
  event_type = 'Song Played';

  constructor(
    public event_properties: SongPlayedProperties,
  ) {
    this.event_properties = event_properties;
  }
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

export class AddToCart implements AnalyticsEvent {
  event_type = 'Add To Cart';
}

export class Checkout implements AnalyticsEvent {
  event_type = 'Checkout';
}

export class EventWithConst implements AnalyticsEvent {
  event_type = 'Event With Const';
  event_properties = {
    'constProp': true,
  };
}

export class EventWithArray implements AnalyticsEvent {
  event_type = 'Event With Array';

  constructor(
    public event_properties?: EventWithArrayProperties,
  ) {
    this.event_properties = event_properties;
  }
}


export interface TrackingPlanMethods{
  userSignedUp(properties?: UserSignedUpProperties): void;
  userLoggedIn(properties: UserLoggedInProperties): void;
  songPlayed(properties: SongPlayedProperties): void;
  songFavorited(properties: SongFavoritedProperties): void;
  addToCart(): void;
  checkout(): void;
  eventWithConst(): void;
  eventWithArray(properties?: EventWithArrayProperties): void;
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
  eventWithArray(properties?: EventWithArrayProperties) {
    this.analytics.track(new EventWithArray(properties))
  }
}

export interface AmplitudeLoadOptions extends Partial<AmplitudeLoadOptionsCore> {
  environment?: Environment,
}

export type BaseExperiment = {
  key: string;
  name: string;
}

/* Codegen Array Experiment */
export namespace CodegenArrayExperimentVariants {
  export type Generic = { key: 'generic', payload: string[] };
  export type Ampli = { key: 'ampli', payload: string[] };

  export enum Keys {
    Generic = 'generic',
    Ampli = 'ampli'
  }
}
export type CodegenArrayExperimentType = BaseExperiment & {
  generic?: CodegenArrayExperimentVariants.Generic;
  ampli?: CodegenArrayExperimentVariants.Ampli;
}
export class CodegenArrayExperiment implements CodegenArrayExperimentType {
  key = 'codegen-array-experiment';
  name = "Codegen Array Experiment";
  variant: CodegenArrayExperimentVariants.Generic |CodegenArrayExperimentVariants.Ampli | undefined;

  constructor(
    public generic?: CodegenArrayExperimentVariants.Generic,
    public ampli?: CodegenArrayExperimentVariants.Ampli,
  ) {}
}
export namespace CodegenArrayExperiment {
  export const Key = 'codegen-array-experiment';
  export const Name = "Codegen Array Experiment";

  export enum Variants {
    Generic = 'generic',
    Ampli = 'ampli'
  }
}

/* Codegen Boolean Experiment */
export namespace CodegenBooleanExperimentVariants {
  export type On = { key: 'on', payload: boolean };

  export enum Keys {
    On = 'on'
  }
}
export type CodegenBooleanExperimentType = BaseExperiment & {
  on?: CodegenBooleanExperimentVariants.On;
}
export class CodegenBooleanExperiment implements CodegenBooleanExperimentType {
  key = 'codegen-boolean-experiment';
  name = "Codegen Boolean Experiment";
  variant: CodegenBooleanExperimentVariants.On | undefined;

  constructor(
    public on?: CodegenBooleanExperimentVariants.On,
  ) {}
}
export namespace CodegenBooleanExperiment {
  export const Key = 'codegen-boolean-experiment';
  export const Name = "Codegen Boolean Experiment";

  export enum Variants {
    On = 'on'
  }
}

/* Codegen Experiment */
export namespace CodegenExperimentVariants {
  export type Control = { key: 'control', payload: any };
  export type Treatment = { key: 'treatment', payload: any };

  export enum Keys {
    Control = 'control',
    Treatment = 'treatment'
  }
}
export type CodegenExperimentType = BaseExperiment & {
  control?: CodegenExperimentVariants.Control;
  treatment?: CodegenExperimentVariants.Treatment;
}
export class CodegenExperiment implements CodegenExperimentType {
  key = 'codegen-experiment';
  name = "Codegen Experiment";
  variant: CodegenExperimentVariants.Control |CodegenExperimentVariants.Treatment | undefined;

  constructor(
    public control?: CodegenExperimentVariants.Control,
    public treatment?: CodegenExperimentVariants.Treatment,
  ) {}
}
export namespace CodegenExperiment {
  export const Key = 'codegen-experiment';
  export const Name = "Codegen Experiment";

  export enum Variants {
    Control = 'control',
    Treatment = 'treatment'
  }
}

/* Codegen String Experiment */
export namespace CodegenStringExperimentVariants {
  export type Control = { key: 'control', payload: string };
  export type Treatment = { key: 'treatment', payload: string };

  export enum Keys {
    Control = 'control',
    Treatment = 'treatment'
  }
}
export type CodegenStringExperimentType = BaseExperiment & {
  control?: CodegenStringExperimentVariants.Control;
  treatment?: CodegenStringExperimentVariants.Treatment;
}
export class CodegenStringExperiment implements CodegenStringExperimentType {
  key = 'codegen-string-experiment';
  name = "Codegen String Experiment";
  variant: CodegenStringExperimentVariants.Control |CodegenStringExperimentVariants.Treatment | undefined;

  constructor(
    public control?: CodegenStringExperimentVariants.Control,
    public treatment?: CodegenStringExperimentVariants.Treatment,
  ) {}
}
export namespace CodegenStringExperiment {
  export const Key = 'codegen-string-experiment';
  export const Name = "Codegen String Experiment";

  export enum Variants {
    Control = 'control',
    Treatment = 'treatment'
  }
}
export interface VariantMethods {
  codegenArrayExperiment(): CodegenArrayExperiment;
  codegenBooleanExperiment(): CodegenBooleanExperiment;
  codegenExperiment(): CodegenExperiment;
  codegenStringExperiment(): CodegenStringExperiment;
}

export interface IExperimentClient extends IExperimentClientCore, Typed<VariantMethods> {}
    
export class Experiment extends ExperimentBrowser implements IExperimentClient {
  private getTypedVariant<T extends BaseExperiment>(exp: T) {
    const variant = this.variant(exp.key);
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

  get typed() {
    const core = this;
    return {
      codegenArrayExperiment(): CodegenArrayExperiment {
        return core.getTypedVariant(new CodegenArrayExperiment());
      },
      codegenBooleanExperiment(): CodegenBooleanExperiment {
        return core.getTypedVariant(new CodegenBooleanExperiment());
      },
      codegenExperiment(): CodegenExperiment {
        return core.getTypedVariant(new CodegenExperiment());
      },
      codegenStringExperiment(): CodegenStringExperiment {
        return core.getTypedVariant(new CodegenStringExperiment());
      }
    };
  }
}

export const experiment = new Experiment();
export const typedExperiment = experiment.typed;


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
