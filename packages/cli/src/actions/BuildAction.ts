import * as fs from "fs";
import * as path from "path";
import { BaseAction } from "./BaseAction";
import { CodeGenerator } from "../generators/code-generator";
import {
  AmplitudeBrowserCodeGenerator,
  AmplitudeNodeCodeGenerator
} from "../generators/typescript/amplitude-generator";
import { TypeScriptExporter } from "../generators/generators";
import { loadLocalConfiguration } from "../config/AmplitudeConfigYamlParser";

export interface BuildActionOptions {
  config: string;
}

export class BuildAction extends BaseAction {
  async run(options: BuildActionOptions) {
    const { config: configPath } = options;

    try {
      const config = loadLocalConfiguration(configPath);
      const { platform, output: outputPath, outputFileName }  = config.codegen().model;

      let generator: CodeGenerator;
      switch (platform) {
        case 'Browser':
          generator = new AmplitudeBrowserCodeGenerator(config);
          break;
        case 'Node':
          generator = new AmplitudeNodeCodeGenerator(config);
          break;
        default:
          console.error(`Unsupported 'platform' ${platform}.`);
          return;
      }

      let exporter = new TypeScriptExporter();
      const outputFiles = await exporter.export(await generator.generate());
      outputFiles.forEach(file => {
        let fileName = file.path;
        if (outputFileName && fileName.startsWith('index')) {
          fileName = fileName.replace('index', outputFileName)
          console.log(`Renamed '${file.path}' to '${fileName}' based on 'settings.outputFileName'.`)
        }

        fs.writeFileSync(path.join(outputPath, fileName), file.code);
      });
    } catch (e) {
      console.log(`Error reading configuration from ${configPath}`, e);
      return;
    }
  }
}
