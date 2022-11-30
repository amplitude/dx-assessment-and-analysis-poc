export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export const jsons = (obj: any) => JSON.stringify(obj, undefined, 2);

export const isEmpty = (obj: Record<any, any>) => obj && Object.keys(obj).length > 1;

export function getProductConfigurationFromEnv(isReact = false) {
  const analyticsApiKey = isReact
    ? process.env.REACT_APP_AMP_ANALYTICS_API_KEY
    : process.env.AMP_ANALYTICS_API_KEY;
  const experimentApiKey = isReact
    ? process.env.REACT_APP_AMP_EXPERIMENT_API_KEY
    : process.env.AMP_EXPERIMENT_API_KEY;

  console.log(`analyticsApiKey`, analyticsApiKey);
  console.log(`experimentApiKey`, experimentApiKey);

  return !(analyticsApiKey || experimentApiKey)
    ? {}
    : {
      configuration: {
        analytics: {
          apiKey: analyticsApiKey,
        },
        experiment: {
          apiKey: experimentApiKey,
        },
      }
    };
}
