export enum ComparisonResult {
  NoChanges = 'noChanges',
  Added = 'added',
  Removed = 'removed',
  Updated = 'updated',
  Conflict = 'conflict'
}

export interface ValueChange {
  origin: any;
  target: any;
}

export type ValueChangeMap = Record<string, ValueChange>;

export function addChange(changes: ValueChangeMap, key: string, origin: any, target: any) {
  changes[key] = {
    origin: origin[key],
    target: target[key],
  }
}
