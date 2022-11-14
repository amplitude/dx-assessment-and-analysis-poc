export type Platform = 'Node' | 'Browser';

export const allPlatforms: Set<Platform> = new Set<Platform>(['Node', 'Browser']);

export type Language = 'TypeScript';

export interface CodeGenerationConfigModel {
  platform: Platform;
  // language: string;
  // sdk: string;
  output: string;
  outputFileName?: string;
  typedAnchorName?: string;
}

export class CodeGenerationConfig {
  constructor(public model: CodeGenerationConfigModel) {}

  getTypedAnchorName(): string {
    return this.model.typedAnchorName || "typed";
  }
}
