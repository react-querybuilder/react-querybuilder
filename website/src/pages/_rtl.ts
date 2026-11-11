import type {
  Combinator,
  Field,
  Operator,
  Translations,
  ValueSource,
  ValueSourceFullOptions,
  ValueSources,
} from 'react-querybuilder';
import { fields as demoFields } from './demo/_constants/fields';

export const combinators: Combinator[] = [
  { name: 'and', label: 'וגם' },
  { name: 'or', label: 'או' },
];

export const operators: Operator[] = [
  { name: '=', label: 'שווה ל־' },
  { name: '!=', label: 'לא שווה ל־' },
  { name: '<', label: 'קטן מ־' },
  { name: '>', label: 'גדול מ־' },
  { name: '<=', label: 'קטן או שווה ל־' },
  { name: '>=', label: 'גדול או שווה ל־' },
  { name: 'contains', label: 'מכיל את' },
  { name: 'beginsWith', label: 'מתחיל ב־' },
  { name: 'endsWith', label: 'מסתיים ב־' },
  { name: 'doesNotContain', label: 'לא מכיל את' },
  { name: 'doesNotBeginWith', label: 'לא מתחיל ב־' },
  { name: 'doesNotEndWith', label: 'לא מסתיים ב־' },
  { name: 'null', label: 'ריק' },
  { name: 'notNull', label: 'לא ריק' },
  { name: 'in', label: 'אחד מ־' },
  { name: 'notIn', label: 'לא אחד מ־' },
  // { name: 'between', label: 'בין … ל־' },
  { name: 'between', label: 'בין' },
  // { name: 'notBetween', label: 'לא בין … ל־' },
  { name: 'notBetween', label: 'לא בין' },
];

const valueSourceLabelMap: Record<ValueSource, string> = {
  value: 'ערך',
  field: 'שדה',
  parameter: 'פרמטר',
  expression: 'ביטוי',
};

const rtlLabels: Record<string, string> = {
  firstName: 'שם פרטי',
  lastName: 'שם משפחה',
  age: 'גיל',
  isMusician: 'מוזיקאי/ת',
  instrument: 'כלי נגינה ראשי',
  // alsoPlays: 'מנגן גם ב־', // Literal translation
  alsoPlays: 'כלי נגינה נוסף', // "Additional instrument"
  gender: 'מגדר',
  height: 'גובה',
  job: 'מקצוע',
  description: 'תיאור',
  birthdate: 'תאריך לידה',
  datetime: 'מועד הופעה',
  alarm: 'שעת תזכורת',
  groupedField1: 'שדה מקובץ 1',
  groupedField2: 'שדה מקובץ 2',
  groupedField3: 'שדה מקובץ 3',
  groupedField4: 'שדה מקובץ 4',
};

const isValueSources = (a: unknown): a is ValueSources => Array.isArray(a);

export const fields: Field[] = demoFields.map(f =>
  Object.assign({}, f, {
    label: rtlLabels[f.name] ?? f.label,
    ...(isValueSources(f.valueSources) && {
      valueSources: f.valueSources.map((vs: ValueSource) => ({
        name: vs,
        value: vs,
        label: valueSourceLabelMap[vs],
      })) as ValueSourceFullOptions,
    }),
  })
);

export const translations: Partial<Translations> = {
  fields: {
    title: 'שדות',
    placeholderLabel: '~ בחירת שדה ~',
    placeholderGroupLabel: '~ בחירת שדה ~',
  },
  operators: {
    title: 'אופרטורים',
    placeholderLabel: '~ בחירת אופרטור ~',
    placeholderGroupLabel: '~ בחירת אופרטור ~',
  },
  values: {
    title: 'ערכים',
    placeholderLabel: '~ בחירת ערך ~',
    placeholderGroupLabel: '~ בחירת ערך ~',
  },
  matchMode: {
    title: 'מצב התאמה',
  },
  matchThreshold: {
    title: 'סף התאמה',
  },
  value: {
    title: 'ערך',
  },
  removeRule: {
    title: 'הסרת כלל',
  },
  removeGroup: {
    title: 'הסרת קבוצה',
  },
  addRule: {
    label: '+ כלל',
    title: 'הוספת כלל',
  },
  addGroup: {
    label: '+ קבוצה',
    title: 'הוספת קבוצה',
  },
  combinators: {
    title: 'מילות קישור',
  },
  notToggle: {
    label: 'לא',
    title: 'היפוך קבוצה זו',
  },
  cloneRule: {
    title: 'שכפול כלל',
  },
  cloneRuleGroup: {
    title: 'שכפול קבוצה',
  },
  ungroupRuleGroup: {
    title: 'פירוק קבוצה',
  },
  shiftActionUp: {
    title: 'הזזה למעלה',
  },
  shiftActionDown: {
    title: 'הזזה למטה',
  },
  undo: {
    title: 'ביטול',
  },
  redo: {
    title: 'ביצוע מחדש',
  },
  dragHandle: {
    title: 'ידית גרירה',
  },
  lockRule: {
    title: 'נעילת כלל',
  },
  lockGroup: {
    title: 'נעילת קבוצה',
  },
  lockRuleDisabled: {
    title: 'ביטול נעילת כלל',
  },
  lockGroupDisabled: {
    title: 'ביטול נעילת קבוצה',
  },
  muteRule: {
    title: 'השתקת כלל',
  },
  muteGroup: {
    title: 'השתקת קבוצה',
  },
  unmuteRule: {
    title: 'ביטול השתקת כלל',
  },
  unmuteGroup: {
    title: 'ביטול השתקת קבוצה',
  },
  valueSourceSelector: {
    title: 'מקור ערך',
  },
};
