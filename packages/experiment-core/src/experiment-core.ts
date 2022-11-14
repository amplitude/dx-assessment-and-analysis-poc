export declare type Variant = {
  /**
   * The value of the variant.
   */
  value?: string;
  /**
   * The attached payload, if any.
   */
  payload?: any;
};

export interface IExperimentClient {
  fetch(): void;
  variant(key: string, fallback?: string): Variant | string;
  exposure(): void;
}
