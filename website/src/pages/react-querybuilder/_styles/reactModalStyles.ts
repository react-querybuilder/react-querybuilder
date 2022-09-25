import type { Styles } from 'react-modal';

export const reactModalStyles: Styles = {
  overlay: {
    display: 'flex',
    alignContent: 'flex-start',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 'calc(var(--ifm-navbar-height) + var(--ifm-global-spacing))',
  },
  content: {
    inset: 'unset',
    padding: 'var(--ifm-global-spacing)',
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--ifm-global-spacing)',
    boxShadow: '4px 4px 12px 4px rgb(0 0 0 / 26%)',
  },
};
