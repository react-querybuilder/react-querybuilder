'use client';

import type { IconButtonProps, SystemStyleObject } from '@chakra-ui/react';
import { ClientOnly, IconButton, Skeleton } from '@chakra-ui/react';
import type { ThemeProviderProps } from 'next-themes';
import { ThemeProvider, useTheme } from 'next-themes';
import * as React from 'react';
import { LuMoon, LuSun } from 'react-icons/lu';

export function ColorModeProvider(props: ThemeProviderProps): React.JSX.Element {
  return <ThemeProvider attribute="class" disableTransitionOnChange {...props} />;
}

export function useColorMode(): {
  colorMode: string | undefined;
  setColorMode: React.Dispatch<React.SetStateAction<string>>;
  toggleColorMode: () => void;
} {
  const { resolvedTheme, setTheme } = useTheme();
  const toggleColorMode = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };
  return {
    colorMode: resolvedTheme,
    setColorMode: setTheme,
    toggleColorMode,
  };
}

export function useColorModeValue<T>(light: T, dark: T): T {
  const { colorMode } = useColorMode();
  return colorMode === 'light' ? light : dark;
}

export function ColorModeIcon(): React.JSX.Element {
  const { colorMode } = useColorMode();
  return colorMode === 'light' ? <LuSun /> : <LuMoon />;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ColorModeButtonProps extends Omit<IconButtonProps, 'aria-label'> {}

const skeletonFallback = <Skeleton boxSize="8" />;

const css: SystemStyleObject = { _icon: { width: 5, height: 5 } };

export const ColorModeButton: React.ForwardRefExoticComponent<
  ColorModeButtonProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, ColorModeButtonProps>(function ColorModeButton(props, ref) {
  const { toggleColorMode } = useColorMode();
  return (
    <ClientOnly fallback={skeletonFallback}>
      <IconButton
        onClick={toggleColorMode}
        variant="ghost"
        aria-label="Toggle color mode"
        size="sm"
        ref={ref}
        {...props}
        css={css}>
        <ColorModeIcon />
      </IconButton>
    </ClientOnly>
  );
});
