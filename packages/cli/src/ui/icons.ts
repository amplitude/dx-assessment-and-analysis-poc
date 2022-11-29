import * as chalk from 'chalk';
import { ComparisonResult } from "../comparison/ComparisonResult";
import hasUnicodeFonts from "./hasUnicodeFonts";

const { redBright, greenBright, blueBright, yellowBright, white, green, red, yellow } = chalk;

export const ICON_RETURN_ARROW = hasUnicodeFonts ? '↳' : '→';
export const ICON_ARROW = hasUnicodeFonts ? '→' : '→';

export const ICON_FOUND = greenBright(hasUnicodeFonts ? '✔' : '[+]');
export const ICON_NOT_FOUND = redBright(hasUnicodeFonts ? '✘' : '[-]');
export const ICON_SUCCESS = greenBright(hasUnicodeFonts ? '✔' : '+');
export const ICON_WARNING = yellowBright(hasUnicodeFonts ? '⚠' : '!');
export const ICON_ERROR = redBright(hasUnicodeFonts ? '✘' : 'X');
export const ICON_INFO = blueBright(hasUnicodeFonts ? 'ℹ' : 'i');

export const ICON_SUCCESS_W_TEXT = `${ICON_SUCCESS} ${green('SUCCESS')}`;
export const ICON_ERROR_W_TEXT = `${ICON_ERROR} ${red('ERROR')}`;
export const ICON_WARNING_W_TEXT = `${ICON_WARNING} ${yellow('WARNING')}`;

const padding = '';
export const ComparisonResultSymbol: Record<ComparisonResult, string> = {
  [ComparisonResult.Added]: greenBright(`${padding}[A]`),
  [ComparisonResult.Removed]: redBright(`${padding}[D]`),
  [ComparisonResult.Updated]: blueBright(`${padding}[U]`),
  // The follow results should exist in CLI (web merge only)
  [ComparisonResult.Conflict]: redBright(`${padding}[C]`),
  [ComparisonResult.NoChanges]: white(`${padding}[${ICON_SUCCESS}]`),
};
