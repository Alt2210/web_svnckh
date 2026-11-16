import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
async function sources(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? sources(path.join(directory, entry.name)) : /\.tsx?$/.test(entry.name) ? [path.join(directory, entry.name)] : []))).flat();
}

test('React presentation code cannot import the database SDK or issue database/storage requests', async () => {
  const src = path.join(root, 'frontend/src');
  for (const file of await sources(src)) {
    const relative = path.relative(src, file).replaceAll('\\', '/');
    if (/^(services|integrations)\//.test(relative)) continue;
    const code = await readFile(file, 'utf8');
    assert.doesNotMatch(code, /from\s+['"][^'"]*(?:@supabase|integrations\/supabase)[^'"]*['"]/, relative);
    assert.doesNotMatch(code, /from\s+['"][^'"]*services\/request['"]/, relative);
    assert.doesNotMatch(code, /\bdatabase\s*\(|\.rpc\s*\(|\.storage\s*\.from\s*\(/, relative);
  }
});

test('data services do not depend on React or presentation modules', async () => {
  for (const file of await sources(path.join(root, 'frontend/src/services'))) {
    const code = await readFile(file, 'utf8');
    assert.doesNotMatch(code, /from\s+['"](?:react(?:\/[^'"]*)?|[^'"]*(?:pages|components|contexts|hooks)\/[^'"]*)['"]/, file);
  }
});

test('frontend source stays independent of backend implementation and privileged credentials', async () => {
  for (const file of await sources(path.join(root, 'frontend/src'))) {
    const code = await readFile(file, 'utf8');
    assert.doesNotMatch(code, /(?:from\s*|import\s*\()['"][^'"]*(?:backend\/|node:)/, file);
    assert.doesNotMatch(code, /SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|sb_secret_[A-Za-z0-9_-]{10,}/, file);
  }
});

test('deployment uses the frontend artifact and remains limited to main', async () => {
  const workflow = await readFile(path.join(root, '.github/workflows/deploy-pages.yml'), 'utf8');
  assert.match(workflow, /branches:\s*\[main\]/);
  assert.match(workflow, /path:\s*frontend\/dist-pages/);
  assert.doesNotMatch(workflow, /SUPABASE_SECRET_KEY|SERVICE_ROLE/);
});
