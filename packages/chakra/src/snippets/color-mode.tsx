'use client';

import { ThemeProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';
import * as React from 'react';

export function ColorModeProvider(props: ThemeProviderProps): React.JSX.Element {
  return <ThemeProvider attribute="class" disableTransitionOnChange {...props} />;
}
