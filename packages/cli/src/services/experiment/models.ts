export type VariantModel = {
  key: string;
  payload?: any;
};

export type ExperimentModel = {
  id: string;
  projectId: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  bucketingKey: string;
  variants: VariantModel[];
  rolloutWeights: { [key: string]: number };
  targetSegments: any[];
  stickyBucketing: boolean;
  state: 'planning' | 'running' | 'analyzing' | 'decision-made';
  startDate: string | null;
  endDate: string | null;

  // TODO: New field needed in API
  deployments?: string[];
};
