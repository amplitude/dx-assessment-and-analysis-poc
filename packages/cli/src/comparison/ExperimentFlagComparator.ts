import {
  addChange,
  addChangeExplicit,
  ComparisonResult,
  ValueChangeMap
} from "./ComparisonResult";
import { isEmpty } from "lodash";
import { FlagConfigModel } from "../config/ExperimentsConfig";
import { sortAlphabetically } from "../generators/util/sorting";

interface FlagConfigComparison {
  result: ComparisonResult;
  origin: FlagConfigModel;
  target: FlagConfigModel;
  changes: ValueChangeMap;
}

export class ExperimentFlagComparator {
  compare(origin: FlagConfigModel, target: FlagConfigModel): FlagConfigComparison {
    let result = ComparisonResult.NoChanges;
    const changes: ValueChangeMap = {};
    if (origin.key !== target.key) {
      addChange(changes, 'key', origin, target);
      result = ComparisonResult.Updated;
    }

    if (origin.description !== target.description) {
      if (!(isEmpty(origin.description) && isEmpty(target.description))) {
        addChange(changes, 'description', origin, target);
        result = ComparisonResult.Updated;
      }
    }

    const originVariantKeys = Object.keys(origin.variants).sort(sortAlphabetically);
    const targetVariantKeys = Object.keys(target.variants).sort(sortAlphabetically);

    let variantsChanged = false;
    if (originVariantKeys.length != targetVariantKeys.length) {
      variantsChanged = true;
    } else  {
      originVariantKeys.forEach(variantKey => {
        const targetVariant = target.variants[variantKey];
        if (!targetVariant) {
          variantsChanged = true;
        }
      })
    }

    if (variantsChanged) {
      result = ComparisonResult.Updated;
      addChangeExplicit(
        changes,
        'variants',
        `{ ${originVariantKeys.join(',')} }`,
        `{ ${targetVariantKeys.join(',')} }`,
      );
    }

    return {
      result,
      origin,
      target,
      changes
    }
  }
}
