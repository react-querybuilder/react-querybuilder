import type { Styles } from 'react-modal';

export const getReactModalStyles = (darkMode?: boolean): Styles => ({
  overlay: {
    backgroundColor: darkMode ? 'rgba(0 0 0 / 75%)' : 'rgba(255 255 255 / 75%)',
    display: 'flex',
    alignContent: 'flex-start',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 'calc(var(--rp-nav-height) + var(--site-spacing))',
  },
  content: {
    inset: 'unset',
    padding: 'var(--site-spacing)',
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--site-spacing)',
    boxShadow: '4px 4px 12px 4px rgb(0 0 0 / 26%)',
    backgroundColor: darkMode ? 'var(--rp-c-bg)' : '#ffffff',
  },
});
