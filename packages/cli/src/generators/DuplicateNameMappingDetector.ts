export class DuplicateNameMappingDetector {
  private mappedNameToOriginalNameLUT: Record<string, string> = {};

  constructor(private getMappedName: (name: string) => string) {
  }

  hasDuplicateNameMapping(name: string) {
    const mappedName = this.getMappedName(name);

    if (this.mappedNameToOriginalNameLUT[mappedName] && this.mappedNameToOriginalNameLUT[mappedName] !== name) {
      return true;
    }

    this.mappedNameToOriginalNameLUT[mappedName] = name;
    return false;
  }
}
