import {
  addChange,
  addChangeExplicit,
  ComparisonResult,
  ValueChangeMap
} from "../../comparison/ComparisonResult";
import { ExperimentFlagModel, VariantModel } from "./models";
import { groupBy, isEmpty } from "lodash";
import { ExperimentConfigModel } from "../../config/ExperimentsConfig";
import { sortAlphabetically } from "../../generators/util/sorting";

interface ExperimentFlagVersionComparison {
  result: ComparisonResult;
  origin: ExperimentFlagModel;
  target: ExperimentFlagModel;
}

interface ExperimentConfigFlagVersionComparison {
  result: ComparisonResult;
  origin: ExperimentConfigModel;
  target: ExperimentConfigModel;
  changes: ValueChangeMap;
}

export class ExperimentFlagComparator {
  compare(origin: ExperimentFlagModel, target: ExperimentFlagModel): ExperimentFlagVersionComparison {
    let result = ComparisonResult.NoChanges;
    if (origin.key != target.key) {
      result = ComparisonResult.Updated;
    }

    if (origin.name != target.name) {
      result = ComparisonResult.Updated;
    }

    if (origin.variants.length != target.variants.length) {
      result = ComparisonResult.Updated;
    } else  {
      const targetVariantMap = groupBy(target.variants, 'key');
      origin.variants.forEach(ov => {
        const targetVariant: VariantModel = targetVariantMap[ov.key]?.[0];
        if (!targetVariant) {
          result = ComparisonResult.Updated;
        }
      })
    }

    return {
      result,
      origin,
      target,
    }
  }

  compare2(origin: ExperimentConfigModel, target: ExperimentConfigModel): ExperimentConfigFlagVersionComparison {
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
