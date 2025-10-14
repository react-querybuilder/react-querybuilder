import { Checkbox as ChakraCheckbox } from '@chakra-ui/react';
import * as React from 'react';

export interface CheckboxProps extends ChakraCheckbox.RootProps {
  icon?: React.ReactNode;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  rootRef?: React.Ref<HTMLLabelElement>;
}

// oxlint-disable no-explicit-any
const Ctrl = ChakraCheckbox.Control as any;
const Lbl = ChakraCheckbox.Label as any;
// oxlint-enable no-explicit-any

export const Checkbox: React.ForwardRefExoticComponent<
  Omit<CheckboxProps, 'ref'> & React.RefAttributes<HTMLInputElement>
> = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(props, ref) {
  const { icon, children, inputProps, rootRef, ...rest } = props;
  return (
    <ChakraCheckbox.Root ref={rootRef} {...rest}>
      <ChakraCheckbox.HiddenInput ref={ref} {...inputProps} />
      <Ctrl>{icon || <ChakraCheckbox.Indicator />}</Ctrl>
      {children != null && <Lbl>{children}</Lbl>}
    </ChakraCheckbox.Root>
  );
});
