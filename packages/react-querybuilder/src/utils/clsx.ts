// Adapted from https://github.com/lukeed/clsx/tree/925494cf31bcd97d3337aacd34e659e80cae7fe2

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ClassDictionary = Record<string, any>;
type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | bigint
  | null
  | boolean
  | undefined;
type ClassArray = ClassValue[];

// istanbul ignore next
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toVal(mix: any) {
  let k;
  let y;
  let str = '';

  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix;
  } else if (typeof mix === 'object') {
    if (Array.isArray(mix)) {
      const len = mix.length;
      for (k = 0; k < len; k++) {
        if (mix[k] && (y = toVal(mix[k]))) {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          str && (str += ' ');
          str += y;
        }
      }
    } else {
      for (y in mix) {
        if (mix[y]) {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          str && (str += ' ');
          str += y;
        }
      }
    }
  }

  return str;
}

// istanbul ignore next
export function clsx(...args: ClassValue[]): string {
  let i = 0;
  let tmp;
  let x;
  let str = '';
  const len = args.length;
  for (; i < len; i++) {
    if ((tmp = args[i]) && (x = toVal(tmp))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      str && (str += ' ');
      str += x;
    }
  }
  return str;
}

export default clsx;
