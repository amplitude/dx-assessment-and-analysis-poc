import { platform } from 'os';

export const hasUnicodeFonts = (platform() !== 'win32');

export default hasUnicodeFonts;
