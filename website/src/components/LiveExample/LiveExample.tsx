import CodeBlock from '@theme/CodeBlock';
import * as React from 'react';
import type { CompileOptions, LiveFile, SucraseTransform } from './runtime';
import { buildSrcDoc, CompileError } from './runtime';
import styles from './styles.module.css';

export interface LiveExampleProps extends Omit<CompileOptions, 'id'> {
  files: LiveFile[];
  /** Authoring error from fence parsing; shown in place of a preview. */
  parseError?: string;
  /** Docusaurus color mode; forwarded to the iframe without reloading it. */
  dark: boolean;
}

interface LiveError {
  kind: 'compile' | 'runtime' | 'network';
  message: string;
  stack?: string;
}

const ERROR_TITLES: Record<LiveError['kind'], string> = {
  compile: 'Compilation error',
  runtime: 'Runtime error',
  network: 'Failed to load dependencies',
};

/** Sucrase is loaded once per page, on demand — never during SSR or on noninteractive pages. */
let sucrasePromise: Promise<SucraseTransform> | undefined;
const loadSucrase = () =>
  // Cleared on failure so a later instance (or client-side navigation) can retry.
  (sucrasePromise ??= import('sucrase').then(
    m => m.transform as unknown as SucraseTransform,
    error => {
      sucrasePromise = undefined;
      throw error;
    }
  ));

const ErrorOverlay = ({ error }: { error: LiveError }) => (
  <div className={styles.overlay}>
    <div className={styles.overlayTitle}>{ERROR_TITLES[error.kind]}</div>
    {error.message}
    {error.stack ? `\n\n${error.stack}` : ''}
  </div>
);

interface PreviewProps {
  srcDoc: string;
  id: string;
  dark: boolean;
}

/**
 * The sandboxed iframe and everything derived from it.
 *
 * Rendered with `key={srcDoc}` so that a change to the compiled document remounts it, resetting
 * `ready`/`height`/`error` without any effect having to reset them by hand.
 */
const Preview = ({ srcDoc, id, dark }: PreviewProps) => {
  const [ready, setReady] = React.useState(false);
  const [height, setHeight] = React.useState(320);
  const [error, setError] = React.useState<LiveError>();
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const postTheme = React.useCallback((isDark: boolean) => {
    iframeRef.current?.contentWindow?.postMessage(
      { source: 'rqb-live-host', type: 'theme', dark: isDark },
      '*'
    );
  }, []);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Only trust messages from this example's own iframe.
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data as
        | { source?: string; id?: string; type?: string; height?: number }
        | undefined;
      if (data?.source !== 'rqb-live' || data.id !== id) return;
      switch (data.type) {
        // The iframe announces itself before the first paint so it can be told the current theme
        // without the host having to guess when it is listening.
        case 'mounted': {
          postTheme(dark);
          break;
        }
        case 'ready': {
          setReady(true);
          break;
        }
        case 'height': {
          if (typeof data.height === 'number' && data.height > 0) {
            setHeight(data.height);
          }
          break;
        }
        case 'error': {
          setError(data as unknown as LiveError);
          setReady(true);
          break;
        }
      }
    };
    globalThis.addEventListener('message', onMessage);
    return () => globalThis.removeEventListener('message', onMessage);
  }, [id, dark, postTheme]);

  React.useEffect(() => {
    postTheme(dark);
  }, [dark, postTheme]);

  return (
    <>
      {!ready && <div className={styles.status}>Loading example…</div>}
      <iframe
        ref={iframeRef}
        title="Live example"
        className={styles.preview}
        style={{ height, visibility: ready ? undefined : 'hidden' }}
        sandbox="allow-scripts allow-popups allow-forms allow-modals"
        srcDoc={srcDoc}
      />
      {error && <ErrorOverlay error={error} />}
    </>
  );
};

export const LiveExample = ({
  files,
  dependencies,
  extraCSSImports,
  parseError,
  dark,
}: LiveExampleProps): React.JSX.Element => {
  const id = React.useId();
  const [transform, setTransform] = React.useState<SucraseTransform>();
  const [loadError, setLoadError] = React.useState<LiveError>();

  React.useEffect(() => {
    let cancelled = false;
    loadSucrase().then(
      loaded => {
        // Wrapped: a function passed to setState is treated as an updater, not a value.
        if (!cancelled) setTransform(() => loaded);
        return undefined;
      },
      error => {
        if (!cancelled) {
          setLoadError({ kind: 'network', message: `Could not load the compiler: ${error}` });
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  // MDX hands this component fresh object identities on every render, so this recomputes more often
  // than it strictly needs to. That is harmless: `srcDoc` is a string, and React only touches the
  // DOM when its *value* changes, so an equal document never reloads the iframe.
  const compiled = React.useMemo((): { srcDoc?: string; error?: LiveError } => {
    if (!transform || parseError) return {};
    try {
      const fileMap = Object.fromEntries(files.map(f => [f.path, f]));
      return { srcDoc: buildSrcDoc(fileMap, transform, { dependencies, extraCSSImports, id }) };
    } catch (error) {
      return {
        error: {
          kind: 'compile',
          message: error instanceof CompileError ? error.message : `${(error as Error)?.message}`,
        },
      };
    }
  }, [files, dependencies, extraCSSImports, transform, parseError, id]);

  const visibleFiles = files.filter(f => !f.hidden);
  const [selected, setSelected] = React.useState<string | undefined>(undefined);
  const selectedFile =
    visibleFiles.find(f => f.path === selected) ??
    visibleFiles.find(f => f.active) ??
    visibleFiles[0];

  const error: LiveError | undefined = parseError
    ? { kind: 'compile', message: parseError }
    : (loadError ?? compiled.error);

  const tabId = (path: string) => `${id}-tab-${path}`;
  const panelId = `${id}-panel`;

  // Arrow-key roving focus, as the `tablist` role implies.
  const onTabKeyDown = (event: React.KeyboardEvent) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (delta === 0) return;
    event.preventDefault();
    const index = visibleFiles.findIndex(f => f.path === selectedFile?.path);
    const next = visibleFiles[(index + delta + visibleFiles.length) % visibleFiles.length];
    setSelected(next.path);
    (
      event.currentTarget.parentElement?.querySelector(`#${CSS.escape(tabId(next.path))}`) as
        | HTMLElement
        | undefined
    )?.focus();
  };

  return (
    <div className={styles.liveExample}>
      <div className={styles.codeColumn}>
        {visibleFiles.length > 1 && (
          <div className={styles.tabs} role="tablist">
            {visibleFiles.map(file => (
              <button
                key={file.path}
                id={tabId(file.path)}
                type="button"
                role="tab"
                aria-selected={file.path === selectedFile?.path}
                aria-controls={panelId}
                tabIndex={file.path === selectedFile?.path ? 0 : -1}
                className={`${styles.tab} ${
                  file.path === selectedFile?.path ? styles.tabActive : ''
                }`}
                onKeyDown={onTabKeyDown}
                onClick={() => setSelected(file.path)}>
                {file.path.replace(/^\//, '')}
              </button>
            ))}
          </div>
        )}
        {selectedFile && (
          <div
            className={styles.code}
            id={panelId}
            role={visibleFiles.length > 1 ? 'tabpanel' : undefined}
            aria-labelledby={visibleFiles.length > 1 ? tabId(selectedFile.path) : undefined}>
            <CodeBlock language={selectedFile.lang}>{selectedFile.code}</CodeBlock>
          </div>
        )}
      </div>
      <div className={styles.previewColumn}>
        {compiled.srcDoc ? (
          <Preview key={compiled.srcDoc} srcDoc={compiled.srcDoc} id={id} dark={dark} />
        ) : (
          !error && <div className={styles.status}>Preparing example…</div>
        )}
        {error && <ErrorOverlay error={error} />}
      </div>
    </div>
  );
};
