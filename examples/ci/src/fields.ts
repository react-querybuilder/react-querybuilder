import { Field, RuleType } from "react-querybuilder";

const validator = (r: RuleType) => !!r.value;

export const fields: Field[] = [
  {
    name: "firstName",
    label: "First Name",
    placeholder: "Enter first name",
    validator
  },
  {
    name: "lastName",
    label: "Last Name",
    placeholder: "Enter last name",
    defaultOperator: "beginsWith",
    validator
  },
  { name: "age", label: "Age", inputType: "number", validator },
  {
    name: "isMusician",
    label: "Is a musician",
    valueEditorType: "checkbox",
    operators: [{ name: "=", label: "is" }],
    defaultValue: false
  },
  {
    name: "instrument",
    label: "Instrument",
    valueEditorType: "select",
    values: [
      { name: "Guitar", label: "Guitar" },
      { name: "Piano", label: "Piano" },
      { name: "Vocals", label: "Vocals" },
      { name: "Drums", label: "Drums" }
    ],
    defaultValue: "Piano",
    operators: [{ name: "=", label: "is" }]
  },
  {
    name: "gender",
    label: "Gender",
    operators: [{ name: "=", label: "is" }],
    valueEditorType: "radio",
    values: [
      { name: "M", label: "Male" },
      { name: "F", label: "Female" },
      { name: "O", label: "Other" }
    ]
  },
  { name: "height", label: "Height", validator },
  { name: "job", label: "Job", validator }
];
