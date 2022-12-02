import * as marked from 'marked';

function htmlEscapeToText(text: string) {
  return text.replace(/&#[0-9]*;|&amp;/g, (escapeCode) => {
    if (escapeCode.match(/amp/)) {
      return '&';
    }
    const code = escapeCode.replace(/[^0-9]/g, '');
    if (code) {
      return String.fromCharCode(Number(code));
    }

    return '';
  });
}

class PlainTextRenderer extends marked.Renderer {
  link(href: string, title: string, text: string) {
    return `${text}: ${href}`;
  }

  paragraph(text: string) {
    return `${htmlEscapeToText(text)}\r\n`;
  }

  heading(text: string, level: number) {
    return `${level} ) ${text}`;
  }

  strong(text: string) {
    return text;
  }

  italic(text: string) {
    return text;
  }

  code(text: string) {
    return text;
  }

  codespan(text: string) {
    return text;
  }

  blockquote(text: string) {
    return text;
  }

  image() {
    return '';
  }
}

export class MarkdownUtil {
  static MATCH_MENTION = /<mention.*?\/>/g;
  static SELECT_USER_NAME = /user-name="([^"]*)/;
  static SELECT_USER_ID = /user-id="([^"]*)/;
  static DATA_MEDIA_SCHEME = 'ampl:';
  static MATCH_AMPL_IMAGE = new RegExp(
    `!\\[.*?\\]\\(${this.DATA_MEDIA_SCHEME}.*?\\)`,
    'g',
  );

  static multilineTextToBlockquote(text: string) {
    return `>${text.includes('\n') ? text.split('\n').join('\n>') : text}`;
  }

  private static replaceMentions(
    text: string,
    replaceFn: (mention: string) => string,
  ) {
    return text
      .replace(/@((?:__|[*#])|\[(.*?)\]\(.*?\))/g, '**$2**') // Legacy mention support
      .replace(this.MATCH_MENTION, replaceFn);
  }

  static replaceMentionsWithNamesForEmail(text: string) {
    return this.replaceMentions(text, (mention) => {
      const match = mention.match(this.SELECT_USER_NAME);
      const selectedName = match?.[1];
      if (!selectedName) {
        return '';
      }

      return `<strong>${selectedName}</strong>`;
    });
  }

  static replaceMentionsWithNames(text: string, markdown = true) {
    return this.replaceMentions(text, (mention) => {
      const match = mention.match(this.SELECT_USER_NAME);
      const selectedName = match?.[1];
      if (!selectedName) {
        return '';
      }
      if (markdown) {
        return selectedName.includes('@')
          ? `**${selectedName.slice(1)}**`
          : `**${selectedName}**`;
      }

      return selectedName.includes('@')
        ? `${selectedName.slice(1)}`
        : `${selectedName}`;
    });
  }

  // For uploaded images, we use the scheme ampl://<s3 info>
  // Which is used to fetch presigned URLs from S3.
  // Wherever markdown (comments/descriptions) will be rendered outside of Amplitude,
  // We need to strip them, else they'll render errors
  static stripAmplImages(text: string) {
    return text.replace(this.MATCH_AMPL_IMAGE, '\n');
  }

  static renderMarkdownToHtml(text: string) {
    return marked(this.stripAmplImages(text));
  }

  static renderMarkdownToText(text: string) {
    return marked(text, {
      renderer: new PlainTextRenderer(),
    });
  }
}
