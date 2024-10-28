import { RadioGroup as ChakraRadioGroup } from '@chakra-ui/react';
import * as React from 'react';

export interface RadioProps extends ChakraRadioGroup.ItemProps {
  rootRef?: React.Ref<HTMLDivElement>;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  children?: React.ReactNode;
  value?: string;
}

export const Radio: React.ForwardRefExoticComponent<
  RadioProps & React.RefAttributes<HTMLInputElement>
> = React.forwardRef<HTMLInputElement, RadioProps>(function Radio(props, ref) {
  const { children, inputProps, rootRef, ...rest } = props;
  return (
    <ChakraRadioGroup.Item ref={rootRef} {...rest}>
      <ChakraRadioGroup.ItemHiddenInput ref={ref} {...inputProps} />
      <ChakraRadioGroup.ItemIndicator />
      {children && <ChakraRadioGroup.ItemText>{children}</ChakraRadioGroup.ItemText>}
    </ChakraRadioGroup.Item>
  );
});

export const RadioGroup: React.ForwardRefExoticComponent<
  ChakraRadioGroup.RootProps & React.RefAttributes<HTMLDivElement>
> = ChakraRadioGroup.Root;
