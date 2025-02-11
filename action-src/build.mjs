#!/usr/bin/env node
/* eslint-disable node/no-unpublished-import */

import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function buildAll() {
    // Note: cjs is the only possible option at this moment.
    await esbuild.build({
        absWorkingDir: __dirname,
        entryPoints: ['src/main_root.ts'],
        bundle: true,
        platform: 'node',
        outfile: '../action/lib/main_root.js',
    });
}

buildAll();
