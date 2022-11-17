export type VariantModel = {
  key: string;
  payload?: any;
};

export type ExperimentFlagModel = {
  // id: string;
  // projectId: string;
  key: string;
  name: string;
  // description: string;
  // enabled: boolean;
  // bucketingKey: string;
  variants: VariantModel[];
  deployments?: string[];
  // rolloutWeights: { [key: string]: number };
  // targetSegments: any[];
  // stickyBucketing: boolean;
  // state: 'planning' | 'running' | 'analyzing' | 'decision-made';
  // startDate: string | null;
  // endDate: string | null;
  //
  // // TODO: New field needed in API
  // deployments?: string[];
};
