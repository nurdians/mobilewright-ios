import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

export type Environment = 'staging' | 'production';

function parseEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return out;
}

const testEnv = (process.env.TEST_ENV ?? 'staging') as Environment;

// Precedence: process.env > .env.<TEST_ENV> > .env
const fileVars = {
  ...parseEnvFile(resolve(projectRoot, '.env')),
  ...parseEnvFile(resolve(projectRoot, `.env.${testEnv}`)),
};

function read(key: string, fallback: string): string {
  return process.env[key] ?? fileVars[key] ?? fallback;
}

export const config = {
  testEnv,
  bundleId: read('BUNDLE_ID', 'com.mobilenext.Milliways'),
  appPath: read('APP_PATH', ''),
  user: {
    email: read('TEST_USER_EMAIL', 'test@example.com'),
    password: read('TEST_USER_PASSWORD', 'password123'),
  },
} as const;
