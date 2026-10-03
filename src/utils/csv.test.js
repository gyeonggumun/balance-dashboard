import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv } from './csv.js';

test('CSV 계좌 열과 빈 값, 쉼표·줄바꿈이 포함된 메모를 유지한다', () => {
  const content = '\uFEFFid,memo,accountId,toAccountId,sourceKey\r\n'
    + '"tx-1","마트, 식료품\n구입","account-1","",""\r\n'
    + '"tx-2","따옴표 ""메모""","account-1","account-2","key-2"';

  assert.deepEqual(parseCsv(content), [
    ['id', 'memo', 'accountId', 'toAccountId', 'sourceKey'],
    ['tx-1', '마트, 식료품\n구입', 'account-1', '', ''],
    ['tx-2', '따옴표 "메모"', 'account-1', 'account-2', 'key-2'],
  ]);
});
