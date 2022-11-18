import axios from 'axios';
import { ExperimentFlagModel } from './models';
import { ExperimentConfigModel } from "../../config/ExperimentsConfig";
import { keyBy } from "lodash";

const EXPERIMENT_MANAGEMENT_API_BASE_URL = 'https://management-api.experiment.amplitude.com';

export class ExperimentApiService {
  private readonly headers: Record<string, string>;

  constructor(private token: string) {
    this.headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async loadFlagsList(deployment: string | undefined, limit = 1000): Promise<ExperimentFlagModel[]> {
    try {
      const response = await axios.get(`${EXPERIMENT_MANAGEMENT_API_BASE_URL}/experiments/list?limit=${limit}`, {
        headers: this.headers,
      });

      const experiments: ExperimentFlagModel[] = response.data.experiments; // eslint-disable-line prefer-destructuring

      // return deployment ? experiments.filter(e => e.key.startsWith(deployment)) : experiments;
      return deployment ? experiments.filter(e => e.deployments.includes(deployment)) : experiments;
    }
    catch (e) {
      return [];
    }
  }

  async loadFlagsList2(deployment: string | undefined, limit = 1000): Promise<ExperimentConfigModel[]> {
    try {
      const experiments: ExperimentFlagModel[] = await this.loadFlagsList(deployment, limit);

      return experiments.map(e => ({
        key: e.key,
        payload: undefined,
        description: e.description,
        variants: keyBy(e.variants, 'key')
      }));
    }
    catch (e) {
      return [];
    }
  }
}
