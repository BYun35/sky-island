import test from 'node:test';
import assert from 'node:assert/strict';
import { MINING_DURATION_MS, advanceMining, startMining, cancelMining } from '../src/mining.js';

test('STEP 1：按住左鍵時裂痕進度增加，泥土不到 1 秒挖除', () => {
  let session = startMining('dirt');
  session = advanceMining(session, 300);
  assert.ok(session.crackStage > 0);
  assert.equal(session.broken, false);
  session = advanceMining(session, MINING_DURATION_MS.dirt - 300);
  assert.equal(session.broken, true);
  assert.ok(MINING_DURATION_MS.dirt < 1000);
});

test('STEP 1：短暫點擊不會挖除方塊', () => {
  const session = advanceMining(startMining('dirt'), 100);
  assert.equal(session.broken, false);
});

test('STEP 1：放開左鍵會取消並清除進度，重新挖掘從頭開始', () => {
  const partiallyMined = advanceMining(startMining('dirt'), 450);
  assert.ok(partiallyMined.crackStage > 0);
  assert.equal(cancelMining(partiallyMined), null);
  const restarted = startMining('dirt');
  assert.equal(restarted.elapsedMs, 0);
  assert.equal(restarted.crackStage, 0);
  assert.equal(restarted.broken, false);
});

test('STEP 1：石頭約需 2 秒，比泥土久', () => {
  const almostBroken = advanceMining(startMining('stone'), 1999);
  assert.equal(almostBroken.broken, false);
  assert.ok(MINING_DURATION_MS.stone > MINING_DURATION_MS.dirt);
  assert.equal(advanceMining(almostBroken, 1).broken, true);
});
