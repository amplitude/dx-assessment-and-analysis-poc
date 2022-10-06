/**
 * Indent each line of text by a provided number of prefixes.
 * Trailing spaces are deleted.
 * @param count Number of prefixes to indent by.
 * @param text Text to indent.
 * @param prefix Prefix.
 * @param indentFirstLine If the first line should be indented (true by default).
 */
export default function i(
  count: number,
  text: string,
  prefix = ' ',
  indentFirstLine = true,
) {
  if (!count || !text) {
    return text;
  }
  const indent = prefix.repeat(count);
  let result = text.replace(/^/gm, indent);
  result = indentFirstLine ? result : result.substr(indent.length);

  return result.replace(/([ \t])+$/gm, '');
}
