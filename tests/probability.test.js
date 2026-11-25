import test from 'node:test';
import assert from 'node:assert/strict';
import { cumulative, threshold } from '../src/probability.js';
import { pools } from '../src/pools.js';
const close = (actual, expected) => assert.ok(Math.abs(actual-expected)<1e-12, `${actual} != ${expected}`);
test('single roll, 5 stones, skill target and boundaries', () => {
  close(cumulative(.016, 1), .016);
  close(cumulative(.016, 5), 1-.984**5);
  close(cumulative(1/60, 5), 1-(59/60)**5);
  assert.equal(cumulative(0, 5), 0);
  assert.equal(cumulative(1, 5), 1);
  assert.equal(cumulative(1, 0), 0);
  assert.ok(Number.isNaN(cumulative(.1, 1.5)));
  assert.ok(Number.isNaN(cumulative(-.1, 5)));
});
test('confidence thresholds are minimal', () => {
  for (const p of [.0096,.016,1/60,.024,.032,.1,1]) for (const c of [.5,.9,.95]) {
    const n=threshold(p,c);
    assert.ok(cumulative(p,n)>=c);
    assert.ok(cumulative(p,n-1)<c);
  }
  assert.equal(threshold(0,.95),Infinity);
});
test('all estimated conditional stat pools sum to 100', () => {
  for(const pool of pools.filter(p=>!p.manual)) close(Object.values(pool.stats).reduce((a,b)=>a+b,0),100);
});
