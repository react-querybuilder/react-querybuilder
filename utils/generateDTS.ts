import { generateDTS as gdts_original } from '@jakeboone02/generate-dts';
import path from 'node:path';

export const generateDTS = (projDir: string): Promise<void> =>
  gdts_original({
    srcDir: path.join(projDir, 'src'),
    outDir: path.join(projDir, 'dist/types'),
    outDirEsm: path.join(projDir, 'dist/types-esm'),
  });
