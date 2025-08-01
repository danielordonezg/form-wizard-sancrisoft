import React, { PropsWithChildren } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';

const theme = {
  colors: {
    primary: '#0ea5e9',
    error: '#ef4444',
    success: '#16a34a',
    text: '#111827',
    muted: '#6b7280',
    border: '#e5e7eb',
    background: '#ffffff',
  },
  radii: { pill: '9999px', md: '8px', sm: '4px' },
};

function AllProviders({ children }: PropsWithChildren) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
