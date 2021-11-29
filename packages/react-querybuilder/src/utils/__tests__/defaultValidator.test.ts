import type { RuleGroupType, RuleGroupTypeIC, ValidationMap } from '../../types';
import { groupInvalidReasons } from '../../defaults';
import defaultValidator from '../defaultValidator';

// standard rule groups
const emptyQuery: RuleGroupType = { id: 'root', combinator: 'and', rules: [] };
const emptyQueryValidationMap: ValidationMap = {
  root: { valid: false, reasons: [groupInvalidReasons.empty] }
};
const queryWithRulesAndInvalidCombinator: RuleGroupType = {
  id: 'root',
  combinator: 'invalid',
  rules: [
    {
      id: 'r-1',
      field: 'field1',
      operator: '=',
      value: ''
    },
    {
      id: 'r-2',
      field: 'field2',
      operator: '=',
      value: ''
    }
  ]
};
const queryWithRulesValidationMap: ValidationMap = {
  root: { valid: false, reasons: [groupInvalidReasons.invalidCombinator] }
};
const queryWithOneRuleAndInvalidCombinator: RuleGroupType = {
  id: 'root',
  combinator: 'invalid',
  rules: [
    {
      id: 'r-1',
      field: 'field1',
      operator: '=',
      value: ''
    }
  ]
};
const queryWithOneRuleValidationMap: ValidationMap = { root: true };
const queryWithOneGroupWithOneRule: RuleGroupType = {
  id: 'root',
  combinator: 'and',
  rules: [
    {
      id: 'innerGroup',
      combinator: 'and',
      rules: [
        {
          id: 'innerRule',
          field: 'field1',
          operator: '=',
          value: ''
        }
      ]
    }
  ]
};
const queryWithOneGroupWithOneRuleValidationMap: ValidationMap = { root: true, innerGroup: true };

// independent combinators
const emptyQueryIC: RuleGroupTypeIC = { id: 'root', rules: [] };
const emptyQueryValidationMapIC: ValidationMap = {
  root: { valid: false, reasons: [groupInvalidReasons.empty] }
};
const queryWithRulesAndInvalidCombinatorIC: RuleGroupTypeIC = {
  id: 'root',
  rules: [
    {
      id: 'r-1',
      field: 'field1',
      operator: '=',
      value: ''
    },
    'invalid',
    {
      id: 'r-2',
      field: 'field2',
      operator: '=',
      value: ''
    }
  ]
};
const queryWithRulesValidationMapIC: ValidationMap = {
  root: { valid: false, reasons: [groupInvalidReasons.invalidIndependentCombinators] }
};
const queryWithOneGroupWithOneRuleIC: RuleGroupTypeIC = {
  id: 'root',
  rules: [
    {
      id: 'innerGroup',
      rules: [
        {
          id: 'innerRule',
          field: 'field1',
          operator: '=',
          value: ''
        }
      ]
    }
  ]
};
const queryWithOneGroupWithOneRuleValidationMapIC: ValidationMap = { root: true, innerGroup: true };

describe('defaultValidator', () => {
  describe('standard rule groups', () => {
    it('should invalidate an empty query', () => {
      expect(defaultValidator(emptyQuery)).toEqual(emptyQueryValidationMap);
    });
    it('should invalidate a group with invalid combinator and run the field validator', () => {
      expect(defaultValidator(queryWithRulesAndInvalidCombinator)).toEqual(
        queryWithRulesValidationMap
      );
    });
    it('should validate a group with invalid combinator but no rules', () => {
      expect(defaultValidator(queryWithOneRuleAndInvalidCombinator)).toEqual(
        queryWithOneRuleValidationMap
      );
    });
    it('should validate a group with only a sub group', () => {
      expect(defaultValidator(queryWithOneGroupWithOneRule)).toEqual(
        queryWithOneGroupWithOneRuleValidationMap
      );
    });
  });

  describe('independent combinators', () => {
    it('should invalidate an empty query', () => {
      expect(defaultValidator(emptyQueryIC)).toEqual(emptyQueryValidationMapIC);
    });
    it('should invalidate a group with invalid combinator and run the field validator', () => {
      expect(defaultValidator(queryWithRulesAndInvalidCombinatorIC)).toEqual(
        queryWithRulesValidationMapIC
      );
    });
    it('should validate a group with only a sub group', () => {
      expect(defaultValidator(queryWithOneGroupWithOneRuleIC)).toEqual(
        queryWithOneGroupWithOneRuleValidationMapIC
      );
    });
  });
});
