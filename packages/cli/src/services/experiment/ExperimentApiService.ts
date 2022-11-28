import axios from 'axios';

const EXPERIMENT_MANAGEMENT_API_BASE_URL = 'https://management-api.experiment.amplitude.com';

export type VariantModel = {
  key: string;
  payload?: any;
};

export type ExperimentFlagModel = {
  // id: string;
  // projectId: string;
  key: string;
  name: string;
  description?: string;
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

export type DeploymentModel = {
  id: string;
  projectId: string;
  label: string;
  key: string;
}

export class ExperimentApiService {
  private readonly headers: Record<string, string>;

  constructor(private token: string) {
    this.headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Get a list of Experiments (aka Flags)
   *
   * https://www.docs.developers.amplitude.com/experiment/apis/management-api/#list-experiments
   *
   * @param deployment
   * @param limit
   */
  async getFlags(deployment: string | undefined, limit = 1000): Promise<ExperimentFlagModel[]> {
    try {
      const response = await axios.get(`${EXPERIMENT_MANAGEMENT_API_BASE_URL}/experiments/list?limit=${limit}`, {
        headers: this.headers,
      });

      const experiments: ExperimentFlagModel[] = response.data.experiments; // eslint-disable-line prefer-destructuring

      // return deployment ? experiments.filter(e => e.key.startsWith(deployment)) : experiments;
      return deployment ? experiments.filter(e => e.deployments.includes(deployment)) : experiments;
    }
    catch (e) {
      console.error(`Error loading Experiment flags from server.`, e)
      return [];
    }
  }

  /**
   * Get a list of Deployments
   *
   * https://www.docs.developers.amplitude.com/experiment/apis/management-api/#list-deployments
   *
   * @param limit
   */
  async getDeployments(limit = 1000): Promise<DeploymentModel[]> {
    try {
      const response = await axios.get(`${EXPERIMENT_MANAGEMENT_API_BASE_URL}/deployments/list?limit=${limit}`, {
        headers: this.headers,
      });

      const deployments: DeploymentModel[] = response.data.deployments; // eslint-disable-line prefer-destructuring

      return deployments;
    }
    catch (e) {
      console.error(`Error loading Experiment deployments from server.`, e)
      return [];
    }
  }
}
