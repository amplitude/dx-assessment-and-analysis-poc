import { program } from 'commander';
import * as fs from "fs";
import * as path from "path";

import { TypeScriptExporter } from "./generators/generators";
import { CodeGenerator } from "./generators/code-generator";
import {
  AmplitudeBrowserCodeGenerator,
  AmplitudeNodeCodeGenerator
} from "./generators/typescript/amplitude-generator";
import { AmplitudeConfig } from "./config/AmplitudeConfig";
import { isValid, parseFromYaml } from "./config/AmplitudeConfigYamlParser";

program.name('Amplitude CLI')
  .description('Generates strongly typed SDKs based on configuration')
  .version('0.0.0');

program.command('build')
  .description('Build typed Amplitude SDK from local configuration')
  .option(
    '--config [configPath]',
    "Amplitude configuration file",
    "amplitude.yml",
  )
  .action(async (options) => {
    const { config: configPath } = options;

    console.log(`Config Path:`, configPath);
    try {
      const ymlConfig = fs.readFileSync(path.resolve(configPath), 'utf8');

      const configModel = parseFromYaml(ymlConfig);
      const configValidation = isValid(configModel);
      if (!configValidation.valid) {
        console.error(`Error loading configuration from ${configPath}.`, configValidation.errors);
        return;
      }

      const config = new AmplitudeConfig(configModel);
      const { platform, output: outputPath, outputFileName }  = configModel.settings;

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

  });

program.parse();
