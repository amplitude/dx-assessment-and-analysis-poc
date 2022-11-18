import { cloneDeepWith } from "lodash";

export function omitDeep(collection, excludeKeys) {
  function omitFn(value) {
    if (value && typeof value === 'object') {
      excludeKeys.forEach((key) => {
        delete value[key];
      });
    }
  }

  return cloneDeepWith(collection, omitFn);
}
