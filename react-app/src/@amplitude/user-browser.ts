import { AmplitudePlugin, AmplitudePluginBase, AmplitudePluginCategory } from "./amplitude-browser";

export interface IUser {
  setUserId(userId: string): void;
  setDeviceId(userId: string): void;
  setUserProperties(userProperties: Record<string, any>): void;
}

export class User extends AmplitudePluginBase implements IUser {
  category: AmplitudePluginCategory = 'USER';

  setUserId(userId: string) {}
  setDeviceId(userId: string) {}
  setUserProperties(userProperties: Record<string, any>) {}
}

// default instance
export const user = new User();
