export const findInput = (el: HTMLElement) =>
  (el.tagName === 'INPUT' ? el : el.querySelector('input')) as HTMLInputElement;

export const findSelect = (el: HTMLElement) =>
  (el.tagName === 'SELECT' ? el : el.querySelector('select')) as HTMLSelectElement;
