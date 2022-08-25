export interface IUser {
  get userId(): string | undefined;
  get deviceId(): string | undefined;
  setUserId(userId: string): void;
  setDeviceId(userId: string): void;
  setUserProperties(userProperties: Record<string, any>): void;
}
