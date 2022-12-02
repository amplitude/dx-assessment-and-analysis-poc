import * as _ from 'lodash';

type Rule = {
  key: string;
  name: string;
};

const STRING_RULES: Rule[] = [
  { key: 'minLength', name: 'Min Length' },
  { key: 'maxLength', name: 'Max Length' },
  { key: 'pattern', name: 'Regex' },
];

const NUMBER_RULES: Rule[] = [
  { key: 'type', name: 'Type' },
  { key: 'minimum', name: 'Min Value' },
  { key: 'maximum', name: 'Max Value' },
];

const ARRAY_RULES: Rule[] = [
  { key: 'minItems', name: 'Min Items' },
  { key: 'maxItems', name: 'Max Items' },
  { key: 'uniqueItems', name: 'Unique Items' },
  { key: 'items.type', name: 'Item Type' },
];

const ENUM_RULES: Rule[] = [{ key: 'enum', name: 'Enum Values' }];

const CONST_RULES: Rule[] = [{ key: 'const', name: 'Const value' }];

const PROPERTY_RULES: { [key: string]: Rule[] } = {
  0: STRING_RULES,
  1: NUMBER_RULES,
  3: ARRAY_RULES,
  5: ENUM_RULES,
  6: CONST_RULES,
};

export default class RulesDescriptionFormatter {
  static formatPropertyRules(property: any): string {
    const propertyRules = PROPERTY_RULES[property.type];
    if (propertyRules) {
      let rulesTable = this.makeRulesTable(property, propertyRules);
      if (rulesTable.length) {
        rulesTable = this.tableHeader() + rulesTable;
      }

      return rulesTable;
    }

    return '';
  }

  private static makeRulesTable(property: any, rules: Rule[]): string {
    const rowSeparator = '\n';
    const rows: any[] = [];

    rules.forEach((rule) => {
      let value = _.get(property.schema, rule.key);
      if (rule.key === ENUM_RULES[0].key && _.isArray(value)) {
        value = value.join(', ');
      }
      rows.push(this.getRow(rule.name, value));
    });

    return rows.filter((s) => !!s).join(rowSeparator);
  }

  private static getRow(rule: string, value: any): string {
    if (value !== undefined) {
      return this.formatTableRow(rule, value);
    }

    return '';
  }

  private static formatTableRow(rule: string, value: any): string {
    return `| ${rule} | ${value} |`;
  }

  private static tableHeader(): string {
    return `| Rule | Value |
|---|---|
`;
  }
}
