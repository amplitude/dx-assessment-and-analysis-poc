import { User as UserCore } from "../@amplitude/user-browser";
import { Event } from "../@amplitude/analytics/core";

/**
 * GENERAL INTERFACES
 */
export interface Typed<T> {
  get data(): T;
}

/**
 * USER
 */
interface UserProperties {
  requiredProp: 'strongly typed';
}
interface TypedUserMethods{
  setUserProperties(properties: UserProperties): void;
}

export class User extends UserCore implements Typed<TypedUserMethods> {
  get data(): TypedUserMethods {
    const core = this;
    return {
      setUserProperties(properties) { core.setUserProperties(properties) },
    };
  }
}

export const user = new User();

/**
 * ANALYTICS
 */
export class UserLoggedIn implements Event {
  event_type = 'User Logged In';
}

export interface TrackingPlanMethods{
  userSignedUp(): void;
  userLoggedIn(): void;
  addToCart(): void;
  checkout(): void;
}

/**
 * EXPERIMENT
 */
export type AMultiVariateExperiment = { control?: any, treatment?: any };

export interface VariantMethods {
  flagCodegenEnabled(): boolean;
  aMultiVariateExperiment(): AMultiVariateExperiment
}
