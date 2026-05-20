/* oxlint-disable typescript/consistent-type-imports */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { QueryBuilderPrime } from '@react-querybuilder/prime';
import Layout from '@theme/Layout';
import 'primeicons/primeicons.css';
import { PrimeReactProvider } from 'primereact/api';
import Tailwind from 'primereact/passthrough/tailwind';
import { useEffect, useState } from 'react';
import type { ControlElementsProp, FullField } from 'react-querybuilder';
import { twMerge } from 'tailwind-merge';
import { loading } from '../_utils';
import './_styles/demo.css';
import './_styles/rqb-prime.css';

const controlElements: ControlElementsProp<FullField, string> = {
  // actionElement: props => <PrimeActionElement {...props} size="small" />,
  // valueEditor: props => <PrimeValueEditor {...props} extraProps={{ size: 'small' }} />,
};

const primePT = {
  // button: {
  //   root: ({ props, context }: { props: { size?: string }; context: { disabled?: boolean } }) => {
  //     const base = Tailwind.button!.root!({ props, context });
  //     // Override text-xs to text-sm for small buttons
  //     if (props.size === 'small') {
  //       return { className: twMerge(base.className, 'text-sm py-2 px-3') };
  //     }
  //     return base;
  //   },
  // },
  // dropdown: {
  //   ...Tailwind.dropdown,
  //   input: (params: { props: Record<string, unknown> }) => {
  //     const base = Tailwind.dropdown!.input!(params);
  //     return { className: twMerge(base.className, 'px-3 py-2') };
  //   },
  // },
};

const primeConfig = {
  unstyled: true,
  pt: { ...Tailwind, ...primePT },
  ptOptions: { mergeSections: true, mergeProps: true, classNameMergeFunction: twMerge },
};

function ReactQueryBuilderDemo_PrimeBrowser() {
  const { colorMode: _cm } = useColorMode();
  const [{ Demo }, setComponents] = useState<{
    Demo?: typeof import('./_components/Demo').default;
  }>({});

  useEffect(() => {
    let active = true;

    (async () => {
      const { default: ImportedDemo } = await import('./_components/Demo');
      if (active && !Demo) {
        setComponents({ Demo: ImportedDemo });
      }
    })();

    return () => {
      active = false;
    };
  }, [Demo]);

  if (!Demo) return loading;

  return (
    <PrimeReactProvider value={primeConfig}>
      <QueryBuilderPrime controlElements={controlElements}>
        <Demo variant="prime" />
      </QueryBuilderPrime>
    </PrimeReactProvider>
  );
}

export default function ReactQueryBuilderDemo_Prime() {
  return (
    <Layout description="React Query Builder PrimeReact Demo">
      <BrowserOnly fallback={loading}>{() => <ReactQueryBuilderDemo_PrimeBrowser />}</BrowserOnly>
    </Layout>
  );
}
