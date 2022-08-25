import { User as UserCore } from "../@amplitude/user-browser";

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
