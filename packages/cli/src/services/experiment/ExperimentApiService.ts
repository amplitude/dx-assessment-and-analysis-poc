import axios from 'axios';
import { ExperimentFlagModel } from './models';

const EXPERIMENT_MANAGEMENT_API_BASE_URL = 'https://management-api.experiment.amplitude.com';

export class ExperimentApiService {
  private readonly headers: Record<string, string>;

  constructor(private token: string) {
    this.headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async getFlagsList(deployment: string | undefined, limit = 1000): Promise<ExperimentFlagModel[]> {
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
}
