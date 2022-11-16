export interface CodeFile {
  path: string;
  code: string;
}

export interface CodeBlockModel {
  code: string;
  tag?: number;
}

export const CodeBlockTag = {
  Default: 0,
  Export: 1,
  Import: 2,
  Header: 3,
};

function sortByCodeBlockTag(a: CodeBlockModel, b: CodeBlockModel) {
  return (b.tag ?? 0) - (a.tag ?? 0);
}

export class CodeBlock {
  protected blocks: CodeBlockModel[];

  constructor(code?: string, tag = CodeBlockTag.Default) {
    this.blocks = code ? [{ tag, code }] : [];
  }

  static from(tag: number, ...code: string[]) {
    return new CodeBlock().addAs(tag, ...code);
  }

  static code(...code: string[]) {
    return new CodeBlock().code(...code);
  }

  static import(...code: string[]) {
    return new CodeBlock().import(...code);
  }

  static export(...code: string[]) {
    return new CodeBlock().export(...code);
  }

  static header(...code: string[]) {
    return new CodeBlock().header(...code);
  }

  add(code: string, tag = CodeBlockTag.Default): CodeBlock {
    this.blocks.push({tag, code});
    return this;
  }

  addAs(tag: number, ...code: string[]): CodeBlock {
    if (code && code.length > 0) {
      code.forEach(c => this.blocks.push({ tag, code: c }));
    }

    return this;
  }

  code(...code: string[]): CodeBlock {
    return this.addAs(CodeBlockTag.Default, ...code);
  }

  import(...code: string[]): CodeBlock {
    return this.addAs(CodeBlockTag.Import, ...code);
  }

  export(...code: string[]): CodeBlock {
    return this.addAs(CodeBlockTag.Export, ...code);
  }

  header(...code: string[]): CodeBlock {
    return this.addAs(CodeBlockTag.Header, ...code);
  }

  merge(...blocks: CodeBlock[]): CodeBlock {
    blocks.forEach(b => {
      this.blocks.push(...b.blocks);
    });
    return this;
  }

  async mergeAsync(...promises: Promise<CodeBlock>[]): Promise<CodeBlock> {
    const blocks = await Promise.all(promises);

    blocks.forEach(b => {
      this.blocks.push(...b.blocks);
    });
    return this;
  }

  toString() {
    const sortedBlocks = this.blocks.sort(sortByCodeBlockTag);
    const headerCode: string[] = [];
    const importCode: string[] = [];
    const exportCode: string[] = [];
    const otherCode: string[] = [];

    sortedBlocks.forEach(b => {
      if (b.tag === CodeBlockTag.Header) {
        headerCode.push(b.code);
      } else if (b.tag === CodeBlockTag.Import) {
        importCode.push(b.code);
      } else if (b.tag === CodeBlockTag.Export) {
        exportCode.push(b.code);
      } else {
        otherCode.push(b.code);
      }
    })

    return headerCode.join('\n')
      .concat('\n\n', importCode.join(`\n`))
      .concat('\n\n', exportCode.join(`\n`))
      .concat('\n\n', otherCode.join(`\n\n`));
  }
}

export interface CodeGenerator {
  generate(): Promise<CodeBlock>;
}

export interface CodeExporter {
  export(codeBlock: CodeBlock): Promise<CodeFile[]>;
}
