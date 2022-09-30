import { program } from 'commander';
import * as fs from "fs";
import * as path from "path";
import { parse } from 'yaml';
import { AmplitudeGeneratorBrowser, AmplitudeGeneratorNode } from "./generators/generators";

const PATH_REACT_APP = '/Users/justin/dev/amplitude/dx-assessment-and-analysis-poc/react-app';

const PATH_AMPLITUDE_YML = `${PATH_REACT_APP}/src/assets/tracking-plans/songs.yml`;

const PATH_OUTPUT_DIR = `${PATH_REACT_APP}/src/amplitude`;
const NAME_OUTPUT_FILE = 'amplitude-gen.ts';

program.name('Amplitude CLI')
  .description('Generates strongly typed SDKs based on configuration')
  .version('0.0.0');

program.command('build')
  .description('Build typed Amplitude SDK from local configuration')
  .option(
    '--config [configPath]',
    "Amplitude configuration file",
    true ? PATH_AMPLITUDE_YML : "amplitude.yml",
  )
  .option(
    '--output [outputPath]',
    "Directory to output generated SDK source code",
    true ? PATH_OUTPUT_DIR: "./amplitude",
  )
  .option(
    '--platform [platform]',
    "Platform for generated code.",
    "typescript",
  )
  .action((options) => {
    const { config: configPath, output, platform } = options;

    const outputFilePath = path.join(output, NAME_OUTPUT_FILE);

    console.log(`Config Path:`, configPath);
    console.log(`Output File:`, outputFilePath);
    try {
      const ymlConfig = fs.readFileSync(path.resolve(configPath), 'utf8');

      const eventSchemas = parse(ymlConfig);
      // console.log(`eventSchemas`, eventSchemas);

      const generator = platform === 'node'
        ? new AmplitudeGeneratorNode()
        : new AmplitudeGeneratorBrowser();

      const outputFiles = generator.generate();
      console.log(`outputFiles`, outputFiles);

      outputFiles.forEach(file => {
        // const fileName = file.path;
        const fileName = `${platform}.ts`;
        fs.writeFileSync(path.join(output, fileName), file.code);
      });
    } catch (e) {
      console.log(`Error reading configuration from ${configPath}`, e);
      return;
    }

  });

program.parse();
