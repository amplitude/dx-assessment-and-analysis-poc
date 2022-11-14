import axios from 'axios';
import { ExperimentModel } from './models';

const EXPERIMENT_MANAGEMENT_API_BASE_URL = 'https://management-api.experiment.amplitude.com';

export class ExperimentApiService {
  private readonly headers: Record<string, string>;

  constructor(private token: string) {
    this.headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async loadExperimentsList(deployment: string | undefined, limit = 1000): Promise<ExperimentModel[]> {
    try {
      const response = await axios.get(`${EXPERIMENT_MANAGEMENT_API_BASE_URL}/experiments/list?limit=${limit}`, {
        headers: this.headers,
      });

      const experiments: ExperimentModel[] = response.data.experiments; // eslint-disable-line prefer-destructuring

      return deployment ? experiments.filter(e => e.key.startsWith(deployment)) : experiments;
    }
    catch (e) {
      return [];
    }
  }
}
