import { ErrorMessages, isValid, parseFromYaml } from '../src/config/AmplitudeConfigYamlParser'

afterEach(() => {
  jest.restoreAllMocks();
});

describe('@amplitude/cli', () => {
  describe('config', () => {
    test('load from YAML', () => {
      const config = parseFromYaml(`\
settings:
  platform: Node
  output: ./amplitude
`)

      expect(config.settings.platform).toBe('Node');
      expect(config.settings.output).toBe('./amplitude');
    });

    test('validates missing settings', () => {
      const config = parseFromYaml('')
      const validation = isValid(config);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toEqual([ErrorMessages.MissingSettings]);
    });

    test(`validates missing settings.platform`, () => {
      const config = parseFromYaml(`\
settings:
  output: ./amplitude
`)
      const validation = isValid(config);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toEqual([ErrorMessages.MissingPlatform]);
    });

    test(`validates missing settings.output`, () => {
      const config = parseFromYaml(`\
settings:
  platform: Node
`)
      const validation = isValid(config);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toEqual([ErrorMessages.MissingOutputPath]);
    });

    test(`validates invalid platform`, () => {
      const invalidPlatform = 'Unsupported';
      const config = parseFromYaml(`\
settings:
  platform: ${invalidPlatform}
  output: ./amplitude
`)
      const validation = isValid(config);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toEqual([ErrorMessages.InvalidPlatform(invalidPlatform)]);
    });
  });
});
