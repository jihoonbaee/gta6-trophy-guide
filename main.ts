import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const entryRoot = dirname(fileURLToPath(import.meta.url));
const destination = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
mkdirSync(destination, { recursive: true });
cpSync(resolve(entryRoot, 'app'), resolve(destination, 'app'), { recursive: true });
mkdirSync(resolve(destination, 'screenshots'), { recursive: true });
const pictures = resolve(entryRoot, 'screenshots');
if (existsSync(pictures)) cpSync(pictures, resolve(destination, 'screenshots'), { recursive: true });

const dossierBytes = await buildDossier(destination, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(resolve(destination, 'dossier.json'), dossierBytes);
