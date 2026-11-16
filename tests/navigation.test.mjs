import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectAuthCallback, routeFromHash } from '../src/lib/auth-callback.ts';

test('PKCE codes are captured once and removed while preserving hosting base and campaign query', () => {
  const parsed = inspectAuthCallback('https://site.test/web_svnckh/?code=one-time-code&utm_source=email#/bao-mat');
  assert.equal(parsed.code, 'one-time-code');
  assert.equal(parsed.cleanUrl, 'https://site.test/web_svnckh/?utm_source=email#/bao-mat');
  assert.equal(inspectAuthCallback(parsed.cleanUrl).hasCallback, false);
});
test('legacy tokens, errors, and recovery parameters never remain on the clean URL', () => {
  const parsed = inspectAuthCallback('http://localhost:5173/#access_token=secret&refresh_token=refresh&type=recovery&expires_in=3600');
  assert.equal(parsed.accessToken, 'secret'); assert.equal(parsed.type, 'recovery');
  assert.equal(parsed.cleanUrl, 'http://localhost:5173/#/');
  const failed = inspectAuthCallback('http://localhost:5173/?error=access_denied&error_description=expired#/dang-nhap');
  assert.equal(failed.hasError, true); assert.equal(failed.cleanUrl, 'http://localhost:5173/#/dang-nhap');
});
test('callback parameters inside route fragments are removed without changing the route', () => {
  const parsed = inspectAuthCallback('https://site.test/web_svnckh/#/dat-lai-mat-khau?code=abc&sb_flow_id=flow&from=email');
  assert.equal(parsed.code, 'abc'); assert.equal(parsed.flowId, 'flow');
  assert.equal(parsed.cleanUrl, 'https://site.test/web_svnckh/#/dat-lai-mat-khau?from=email');
});
test('ordinary landing anchors, internal query parameters, and history routes remain valid', () => {
  assert.equal(inspectAuthCallback('https://site.test/#mang-luoi').hasCallback, false);
  assert.equal(routeFromHash('#/tai-khoan/'), '/tai-khoan');
  assert.equal(routeFromHash('#//clb//tao'), '/clb/tao');
  assert.equal(routeFromHash('#%2Ftai-khoan'), '/tai-khoan');
  assert.equal(routeFromHash('#/hoat-dong?tab=mine'), '/hoat-dong?tab=mine');
  assert.equal(routeFromHash('#access_token=x'), '/');
  assert.equal(routeFromHash('#mang-luoi'), '/');
});
