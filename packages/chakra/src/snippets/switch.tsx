import { Switch as ChakraSwitch } from '@chakra-ui/react';
import * as React from 'react';

export interface SwitchProps extends ChakraSwitch.RootProps {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  rootRef?: React.Ref<HTMLLabelElement>;
  trackLabel?: { on: React.ReactNode; off: React.ReactNode };
  thumbLabel?: { on: React.ReactNode; off: React.ReactNode };
}

// oxlint-disable no-explicit-any
const Ctrl = ChakraSwitch.Control as any;
const Thumb = ChakraSwitch.Thumb as any;
const Lbl = ChakraSwitch.Label as any;
// oxlint-enable no-explicit-any

export const Switch: React.ForwardRefExoticComponent<
  Omit<SwitchProps, 'ref'> & React.RefAttributes<HTMLInputElement>
> = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(props, ref) {
  const { inputProps, children, rootRef, trackLabel, thumbLabel, ...rest } = props;

  return (
    <ChakraSwitch.Root ref={rootRef} {...rest}>
      <ChakraSwitch.HiddenInput ref={ref} {...inputProps} />
      <Ctrl>
        <Thumb>
          {thumbLabel && (
            <ChakraSwitch.ThumbIndicator fallback={thumbLabel?.off}>
              {thumbLabel?.on}
            </ChakraSwitch.ThumbIndicator>
          )}
        </Thumb>
        {trackLabel && (
          <ChakraSwitch.Indicator fallback={trackLabel.off}>{trackLabel.on}</ChakraSwitch.Indicator>
        )}
      </Ctrl>
      {children != null && <Lbl>{children}</Lbl>}
    </ChakraSwitch.Root>
  );
});
