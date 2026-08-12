/**
 * Turns a rendered `<QueryBuilder>` into the two things ports are held to: the `class` attribute
 * of every element that has one, and the accessible description (`title`) of every rule group.
 *
 * Two walkers, for two render paths:
 * - `extractFromMarkup` parses a static markup string (the `renderToStaticMarkup` path) with
 *   Bun's `HTMLRewriter`. Note that the `Response` overload is required: `transform(string)` runs
 *   `onEndTag` callbacks in a single flush at the end, which destroys the nesting order the
 *   ancestor stack depends on.
 * - `extractFromContainer` walks a live DOM subtree (the jsdom / post-flush path), ported
 *   upstream from the Svelte and Vue conformance harnesses, which already proved it produces
 *   output matching `HTMLRewriter`'s across all 49 static cases.
 */

/** One element's contribution to the rendered class surface, in document order. */
export interface ClassNameEntry {
  /** Lowercased tag name. */
  tag: string;
  /** `data-testid`, when present. This is the stable handle ports should key off. */
  testID?: string;
  /**
   * The `data-path` of the nearest enclosing rule or rule group (or of the element itself, for
   * the rule/group element). Absent for chrome outside any rule, i.e. the root wrapper.
   */
  path?: string;
  /** The verbatim `class` attribute. Whitespace is preserved; this is a byte-level claim. */
  className: string;
  /**
   * The concatenation of this element's *own* direct text-node children, verbatim — no trimming,
   * no whitespace collapsing, no descendant text. `''` when the element has no direct text nodes
   * (present rather than omitted, so the key set is stable across entries).
   *
   * Verbatim is the point: the drift this channel catches is a stray space inside a label or a
   * whitespace text node emitted by a template compiler, both of which are invisible under any
   * normalization (jest-dom's `toHaveTextContent` included). Descendant text is deliberately
   * excluded: `textContent` would repeat a single label at every ancestor level, inflating the
   * fixtures and burying which element actually changed.
   *
   * Character references are decoded, i.e. this is DOM text-node semantics. `HTMLRewriter` hands
   * back raw source text, so `extractFromMarkup` decodes to match `extractFromContainer`.
   */
  text: string;
}

/** The accessible description (`title`) of one rule group. */
export interface AccessibleDescriptionEntry {
  path: string;
  description: string;
}

export interface ExtractResult {
  classNames: ClassNameEntry[];
  accessibleDescriptions: AccessibleDescriptionEntry[];
}

const RULE_GROUP_TESTID = 'rule-group';

/**
 * Void elements have no end tag, and `HTMLRewriter` *throws* from `onEndTag` for them rather
 * than silently ignoring the call. They can never be an ancestor, so they are simply never
 * pushed onto the path stack.
 *
 * Dead for `extractFromContainer`: a live DOM subtree materializes ancestry directly, and
 * there's no `onEndTag`-throws-on-void-elements hazard to work around. Left here (and still
 * used by `extractFromMarkup`) rather than duplicated.
 */
const voidElements = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

/**
 * Decodes character references, so that `extractFromMarkup`'s text matches
 * `extractFromContainer`'s. `HTMLRewriter` reports text chunks as they appear in the source, but
 * React escapes `&`, `<`, `>`, `"`, and `'` on the way in — without this the two walkers would
 * disagree on any label containing one of them. Numeric references are handled because that is
 * what React emits for `"` and `'`. Not a general-purpose entity decoder, and it does not need to
 * be: every text node here originates from a React render.
 */
const namedRefs: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00A0',
};
const decodeText = (text: string): string =>
  text.replaceAll(
    /&(?:#(\d+)|#[Xx]([\dA-Fa-f]+)|([A-Za-z]+));/g,
    (match, dec: string, hex: string, name: string) =>
      dec
        ? String.fromCodePoint(Number.parseInt(dec, 10))
        : hex
          ? String.fromCodePoint(Number.parseInt(hex, 16))
          : (namedRefs[name.toLowerCase()] ?? match)
  );

/** Parses a markup string. The `renderToStaticMarkup` path. */
export const extractFromMarkup = async (html: string): Promise<ExtractResult> => {
  const classNames: ClassNameEntry[] = [];
  const accessibleDescriptions: AccessibleDescriptionEntry[] = [];

  // Nearest-enclosing-`data-path` stack. Pushed for every element so that `onEndTag` can pop
  // unconditionally; elements without their own `data-path` inherit their parent's.
  const pathStack: (string | undefined)[] = [];
  // Parallel to `pathStack`: the entry text chunks belong to, or `undefined` for an element with
  // no `class` attribute (which produces no entry). The top of this stack is the *direct* parent
  // of any text chunk, which is what makes `text` own-text rather than `textContent`.
  const entryStack: (ClassNameEntry | undefined)[] = [];

  await new HTMLRewriter()
    .on('*', {
      element(element) {
        const ownPath = element.getAttribute('data-path') ?? undefined;
        const inheritedPath = pathStack.at(-1);
        const path = ownPath ?? inheritedPath;

        const tag = element.tagName.toLowerCase();
        const testID = element.getAttribute('data-testid') ?? undefined;
        const className = element.getAttribute('class');

        let entry: ClassNameEntry | undefined;
        if (className !== null) {
          entry = {
            tag,
            ...(testID === undefined ? {} : { testID }),
            ...(path === undefined ? {} : { path }),
            className,
            text: '',
          };
          classNames.push(entry);
        }

        if (!voidElements.has(tag)) {
          pathStack.push(path);
          entryStack.push(entry);
          element.onEndTag(() => {
            pathStack.pop();
            entryStack.pop();
          });
        }

        if (testID === RULE_GROUP_TESTID && ownPath !== undefined) {
          const description = element.getAttribute('title');
          if (description !== null) {
            accessibleDescriptions.push({ path: ownPath, description });
          }
        }
      },
      text(chunk) {
        const entry = entryStack.at(-1);
        if (entry) entry.text += decodeText(chunk.text);
      },
    })
    .transform(new Response(html))
    .text();

  return { classNames, accessibleDescriptions };
};

/** Walks a live DOM subtree. The jsdom / post-flush path. */
export const extractFromContainer = (container: Element): ExtractResult => {
  const classNames: ClassNameEntry[] = [];
  const accessibleDescriptions: AccessibleDescriptionEntry[] = [];

  for (const element of container.querySelectorAll('*')) {
    const ownPath = element.getAttribute('data-path') ?? undefined;
    const path = ownPath ?? element.closest('[data-path]')?.getAttribute('data-path') ?? undefined;

    const tag = element.tagName.toLowerCase();
    const testID = element.getAttribute('data-testid') ?? undefined;
    const className = element.getAttribute('class');

    if (className !== null) {
      classNames.push({
        tag,
        ...(testID === undefined ? {} : { testID }),
        ...(path === undefined ? {} : { path }),
        className,
        // Direct text-node children only, in document order. `Node.TEXT_NODE` is spelled `3` so
        // this works against whatever DOM implementation a port hands in.
        text: [...element.childNodes]
          .filter(node => node.nodeType === 3)
          .map(node => node.nodeValue ?? '')
          .join(''),
      });
    }

    if (testID === RULE_GROUP_TESTID && ownPath !== undefined) {
      const description = element.getAttribute('title');
      if (description !== null) accessibleDescriptions.push({ path: ownPath, description });
    }
  }

  return { classNames, accessibleDescriptions };
};
