import type {
  Combinator,
  Field,
  Operator,
  Translations,
  ValueSource,
  ValueSourceFullOptions,
} from 'react-querybuilder/debug';
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
  { name: 'notNull', label: 'אינו ריק' },
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
};

const rtlLabels: Record<string, string> = {
  firstName: 'שם פרטי',
  lastName: 'שם משפחה',
  age: 'גיל',
  isMusician: 'עוסק במוזיקה',
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

export const fields: Field[] = demoFields.map(f => ({
  ...f,
  label: rtlLabels[f.name] ?? f.label,
  ...(f.valueSources && {
    valueSources: f.valueSources.map(vs => ({
      name: vs,
      value: vs,
      label: valueSourceLabelMap[vs],
    })) as ValueSourceFullOptions,
  }),
}));

export const translations: Partial<Translations> = {
  fields: {
    title: 'שדות',
  },
  operators: {
    // title: 'מחברים', // More natural in Hebrew
    title: 'אופרטורים', // More appropriate for technical context
  },
  values: {
    title: 'ערכים',
  },
  value: {
    title: 'ערך',
  },
  removeRule: {
    title: 'כלל',
  },
  removeGroup: {
    title: 'קבוצה',
  },
  addRule: {
    label: 'הוסף כלל',
    title: 'הוסף כלל',
  },
  addGroup: {
    label: 'הוסף קבוצה',
    title: 'הוסף קבוצה',
  },
  combinators: {
    // title: 'מחברים',
    title: 'מילות קישור', // Conjunctions / linking words
  },
  notToggle: {
    label: 'לא',
    // title: 'הפוך קבוצה זו',
    title: 'הפוך את המשמעות של קבוצה לוגית זו',
  },
  cloneRule: {
    title: 'שכפל',
  },
  cloneRuleGroup: {
    title: 'שכפל קבוצה',
  },
  shiftActionUp: {
    title: 'הזז מעלה',
  },
  shiftActionDown: {
    title: 'הזז מטה',
  },
  dragHandle: {
    title: 'ידית גרירה',
  },
  lockRule: {
    title: 'נעל כלל',
  },
  lockGroup: {
    title: 'נעל קבוצה',
  },
  lockRuleDisabled: {
    title: 'בטל נעילה לכלל',
  },
  lockGroupDisabled: {
    title: 'בטל נעילה לקבוצה',
  },
  valueSourceSelector: {
    title: 'קור ערך',
  },
};
