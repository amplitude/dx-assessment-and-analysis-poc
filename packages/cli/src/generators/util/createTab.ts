/**
 * Returns tab FUNCTION that will create @tabs of @spaces spaces
 *
 * @param spaces Number of spaces to indent a tab.
 * @return tab(tabs: number, text: string): string
 */
import i from './i';

export type TabFunctionType = (
  tabs: number,
  text: string | undefined,
) => string;

export default function createTab(
  spaces: number,
  indentFirstLine = true,
  prefix = ' ',
): TabFunctionType {
  return (tabs: number, text = '') =>
    i(spaces * tabs, text, prefix, indentFirstLine);
}
