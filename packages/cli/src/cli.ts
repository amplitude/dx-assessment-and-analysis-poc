import { program } from 'commander';
import * as fs from "fs";
import * as path from "path";
import { parse } from 'yaml';
import { AmplitudeGeneratorBrowser, AmplitudeGeneratorNode, CodeGenerator } from "./generators/generators";

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
  .action((options) => {
    const { config: configPath } = options;

    console.log(`Config Path:`, configPath);
    try {
      const ymlConfig = fs.readFileSync(path.resolve(configPath), 'utf8');

      const config = parse(ymlConfig);

      if (!config.settings || !config.settings.platform || !config.settings.output) {
        console.error(`Missing required 'settings'. 'settings.platform' and 'settings.output' are required.`);
        return;
      }

      const { platform, output: outputPath, outputFileName }  = config.settings;

      let generator: CodeGenerator;
      switch (platform) {
        case 'Browser':
          generator = new AmplitudeGeneratorBrowser();
          break;
        case 'Node':
          generator = new AmplitudeGeneratorNode();
          break;
        default:
          console.error(`Unsupported 'platform' ${platform}.`);
          return;
      }

      const outputFiles = generator.generate();
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
