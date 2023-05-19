// > bun test --preload bunTestSetup.ts

// Set up happy-dom
import { Window } from 'happy-dom';
const window = new Window();
const document = window.document;
(globalThis as any).document = document;
(globalThis as any).window = window;

import { describe, expect, it } from 'bun:test';

(globalThis as any).describe = describe;
(globalThis as any).expect = expect;
(globalThis as any).it = it;
