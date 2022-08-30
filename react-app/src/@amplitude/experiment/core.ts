export interface IExperimentClient {
  fetch(): void;
  variant(key: string): boolean;
  exposure(): void;
}
