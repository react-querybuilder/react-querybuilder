/**
 * Turns the static markup produced by `<QueryBuilder>` into the two things ports are held to:
 * the `class` attribute of every element that has one, and the accessible description (`title`)
 * of every rule group.
 *
 * Parsing is done with Bun's `HTMLRewriter` rather than a regex or a DOM shim. Note that the
 * `Response` overload is required: `transform(string)` runs `onEndTag` callbacks in a single
 * flush at the end, which destroys the nesting order the ancestor stack depends on.
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
 * Extracts the class surface and the accessible descriptions from one rendered query builder.
 */
export const extract = async (html: string): Promise<ExtractResult> => {
  const classNames: ClassNameEntry[] = [];
  const accessibleDescriptions: AccessibleDescriptionEntry[] = [];

  // Nearest-enclosing-`data-path` stack. Pushed for every element so that `onEndTag` can pop
  // unconditionally; elements without their own `data-path` inherit their parent's.
  const pathStack: (string | undefined)[] = [];

  await new HTMLRewriter()
    .on('*', {
      element(element) {
        const ownPath = element.getAttribute('data-path') ?? undefined;
        const inheritedPath = pathStack.at(-1);
        const path = ownPath ?? inheritedPath;

        const tag = element.tagName.toLowerCase();
        if (!voidElements.has(tag)) {
          pathStack.push(path);
          element.onEndTag(() => {
            pathStack.pop();
          });
        }

        const testID = element.getAttribute('data-testid') ?? undefined;
        const className = element.getAttribute('class');

        if (className !== null) {
          classNames.push({
            tag,
            ...(testID === undefined ? {} : { testID }),
            ...(path === undefined ? {} : { path }),
            className,
          });
        }

        if (testID === RULE_GROUP_TESTID && ownPath !== undefined) {
          const description = element.getAttribute('title');
          if (description !== null) {
            accessibleDescriptions.push({ path: ownPath, description });
          }
        }
      },
    })
    .transform(new Response(html))
    .text();

  return { classNames, accessibleDescriptions };
};
