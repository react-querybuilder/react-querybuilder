// Ambient module for shadcn registry source files; @/ resolves only in consumer projects
// oxlint-disable no-explicit-any
declare module '@/components/*' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type AnyComponent = any;

  const Button: AnyComponent;
  const Checkbox: AnyComponent;
  const Input: AnyComponent;
  const Label: AnyComponent;
  const RadioGroup: AnyComponent;
  const RadioGroupItem: AnyComponent;
  const Select: AnyComponent;
  const SelectContent: AnyComponent;
  const SelectGroup: AnyComponent;
  const SelectItem: AnyComponent;
  const SelectLabel: AnyComponent;
  const SelectTrigger: AnyComponent;
  const SelectValue: AnyComponent;
  const Switch: AnyComponent;
  const Textarea: AnyComponent;

  type ButtonProps = Record<string, unknown>;
  type SelectProps = Record<string, unknown>;
  type SwitchProps = Record<string, unknown>;

  export {
    Button,
    Checkbox,
    Input,
    Label,
    RadioGroup,
    RadioGroupItem,
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
    Switch,
    Textarea,
  };
  export type { ButtonProps, SelectProps, SwitchProps };
}
