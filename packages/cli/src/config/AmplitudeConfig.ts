import { AmplitudeConfigModel, CodeGenerationSettings } from "../config";
import { AnalyticsConfig } from "./AnalyticsConfig";
import { ExperimentsConfig } from "./ExperimentsConfig";

/**
 * AmplitudeConfig
 */
export class AmplitudeConfig {
  constructor(private model: AmplitudeConfigModel) {}

  codegen(): CodeGenerationSettings {
    return new CodeGenerationSettings(this.model.settings);
  }

  analytics(): AnalyticsConfig {
    return new AnalyticsConfig(this.model.analytics);
  }

  experiment(): ExperimentsConfig {
    return new ExperimentsConfig(this.model.experiments);
  }
}
