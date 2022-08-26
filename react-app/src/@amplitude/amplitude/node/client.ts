import { IUser } from "../core/user";
import { Amplitude as AmplitudeCore } from "../core/client";

export interface UserClient<T> {
  userId(userId: string): T;
  deviceId(deviceId: string): T;
  user(user: IUser): T;
}

export class Amplitude extends AmplitudeCore {}

export const amplitude = new Amplitude();
