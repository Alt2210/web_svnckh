import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../src/lib/csv.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { csvCell, createCsv } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
test('CSV exports escape quotes/newlines, preserve Vietnamese, and neutralize spreadsheet formulas', () => {
  assert.equal(csvCell('Nguyễn "An", CLB\nmới'), '"Nguyễn ""An"", CLB\nmới"');
  for (const value of ['=HYPERLINK("https://example.com")', ' +123', '@SUM(A1)', '-2+3', '\t=1+1', '\n=1']) assert.ok(csvCell(value).startsWith('"\''));
  assert.equal(csvCell('Nghiên cứu'), '"Nghiên cứu"');
  assert.equal(createCsv([['Tên', 'Điểm'], ['An', 5]]), '\uFEFF"Tên","Điểm"\r\n"An","5"');
});
