import { Amplitude as AmplitudeCore, IUser } from "@amplitude/amplitude-core";

export interface UserClient<T> {
  userId(userId: string): T;
  deviceId(deviceId: string): T;
  user(user: IUser): T;
}

export class Amplitude extends AmplitudeCore {}

// @ts-ignore
export const amplitude = new Amplitude();
