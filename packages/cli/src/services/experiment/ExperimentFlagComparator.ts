import { ComparisonResult } from "../../comparison/ComparisonResult";
import { ExperimentFlagModel, VariantModel } from "./models";
import { groupBy } from "lodash";
import { ExperimentConfigModel } from "../../config/ExperimentsConfig";

interface ExperimentFlagVersionComparison {
  result: ComparisonResult;
  origin: ExperimentFlagModel;
  target: ExperimentFlagModel;
}

interface ExperimentConfigFlagVersionComparison {
  result: ComparisonResult;
  origin: ExperimentConfigModel;
  target: ExperimentConfigModel;
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
    if (origin.key != target.key) {
      result = ComparisonResult.Updated;
    }

    if (origin.description != target.description) {
      result = ComparisonResult.Updated;
    }

    const originVariantKeys = Object.keys(origin.variants);
    const targetVariantKeys = Object.keys(target.variants);

    if (originVariantKeys.length != targetVariantKeys.length) {
      result = ComparisonResult.Updated;
    } else  {
      originVariantKeys.forEach(variantKey => {
        const targetVariant = target.variants[variantKey];
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
}
