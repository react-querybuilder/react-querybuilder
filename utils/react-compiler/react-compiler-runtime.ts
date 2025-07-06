import * as React from 'react';

const $empty: unique symbol = Symbol.for('react.memo_cache_sentinel');

export function c(size: number): unknown[] {
  return React.useMemo<Array<unknown>>(
    () => {
      const $ = new Array(size);
      for (let ii = 0; ii < size; ii++) {
        $[ii] = $empty;
      }
      // This symbol is added to tell the react devtools that this array is from
      // useMemoCache.
      // @ts-expect-error we know this is a symbol
      $[$empty] = true;
      return $;
    },
    // oxlint-disable-next-line exhaustive-deps
    []
  );
}
