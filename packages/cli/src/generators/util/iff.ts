/**
 * If @condition is true output @text, otherwise ''
 *
 * @param condition
 * @param text
 */
export default function iff(
  condition: boolean | string | undefined,
  text: string,
) {
  return condition ? text : '';
}
