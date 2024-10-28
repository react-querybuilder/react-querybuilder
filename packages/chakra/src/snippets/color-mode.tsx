'use client'

import { ThemeProvider, useTheme } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes/dist/types'

export function ColorModeProvider(props: ThemeProviderProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  )
}
