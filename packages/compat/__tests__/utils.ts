export const findInput = (el: HTMLElement) =>
  (el.tagName === 'INPUT' ? el : el.querySelector('input')) as HTMLInputElement;

export const findSelect = (el: HTMLElement) =>
  (el.tagName === 'SELECT' ? el : el.querySelector('select')) as HTMLSelectElement;

export const hasOrInheritsClass = (
  el: HTMLElement | null,
  className: string,
  attempt = 1
): boolean => {
  if (!el || el.tagName === 'BODY') {
    return false;
  }
  if (el.classList.contains(className)) {
    return true;
  }
  if (attempt >= 10) {
    return false;
  }
  return hasOrInheritsClass(el.parentElement, className, attempt + 1);
};

export const hasOrInheritsData = (
  el: HTMLElement | null,
  dataAttr: string,
  attempt = 1
): boolean => {
  if (!el || el.tagName === 'BODY') {
    return false;
  }
  if (typeof el.dataset[dataAttr] !== 'undefined') {
    return true;
  }
  if (attempt >= 10) {
    return false;
  }
  return hasOrInheritsData(el.parentElement, dataAttr, attempt + 1);
};

export const isOrInheritsChecked = (el: HTMLElement | null, attempt = 1): boolean => {
  if (!el || el.tagName === 'BODY') {
    return false;
  }
  try {
    expect(el).toBeChecked();
    return true;
  } catch (er) {
    if (attempt < 10) {
      return isOrInheritsChecked(el.parentElement, attempt + 1);
    }
  }
  return false;
};

export const errorMessageIsAboutPointerEventsNone = (e: Error) =>
  e.message.includes('pointer-events set to "none"');
