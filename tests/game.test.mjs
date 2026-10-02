import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const core = html.match(/<script id="game-core">([\s\S]*?)<\/script>/)[1];
const api = vm.runInNewContext(core + '\n({RULES, RECIPES, newWork, waterReady, brewReady, requiredIngredients, buildReady, finishReady, rewardFor, starsFor, whiskSample})');
const { RULES, RECIPES, newWork, waterReady, brewReady, requiredIngredients, buildReady, finishReady, rewardFor, starsFor, whiskSample } = api;

test('every recipe can complete only after brewing, building, and finishing', () => {
  for (const r of RECIPES) {
    const w = newWork();
    assert.equal(finishReady(w, r), false);
    w.scoops = r.scoops;
    w.water = r.water;
    assert.equal(brewReady(w, r), false, 'water and scoops alone are not brewed');
    w.whisk = RULES.whiskRadians;
    assert.equal(brewReady(w, r), true);
    assert.equal(buildReady(w, r), false);
    w.ingredients = [...requiredIngredients(r)];
    assert.equal(buildReady(w, r), true);
    assert.equal(finishReady(w, r), false);
    w.lid = true;
    assert.equal(finishReady(w, r), !r.topping, 'requested topping is mandatory');
    w.topping = r.topping;
    assert.equal(finishReady(w, r), true);
  }
});

test('water allows an eight milliliter margin but rejects under/over pours', () => {
  for (const r of RECIPES) {
    const w = newWork();
    for (const offset of [-8, 0, 8]) { w.water = r.water + offset; assert.equal(waterReady(w, r), true); }
    for (const offset of [-9, 9]) { w.water = r.water + offset; assert.equal(waterReady(w, r), false); }
  }
});

test('drink progress is independent for simultaneous tickets', () => {
  const first = newWork(), second = newWork();
  first.scoops = 2;
  first.ingredients.push('ice');
  assert.equal(second.scoops, 0);
  assert.equal(second.ingredients.length, 0);
});

test('whisk accepts steady circles in either direction and crosses the angle seam', () => {
  for (const direction of [-1, 1]) {
    const sample = whiskSample({angle:0,radius:.7}, {angle:direction*.4,radius:.7}, .08);
    assert.equal(sample.valid, true);
    assert.equal(sample.amount, .4);
  }
  const seam = whiskSample({angle:3.1,radius:.8}, {angle:-3.1,radius:.8}, .05);
  assert.ok(seam.amount > .08 && seam.amount < .09);
});

test('whisk rejects fast, slow, outside, center, and interrupted motions', () => {
  const previous = {angle:0,radius:.8};
  assert.equal(whiskSample(previous,{angle:1,radius:.8},.01).amount,0);
  assert.equal(whiskSample(previous,{angle:.001,radius:.8},.1).amount,0);
  assert.equal(whiskSample(previous,{angle:.4,radius:1.5},.08).amount,0);
  assert.equal(whiskSample(previous,{angle:.4,radius:.1},.08).amount,0);
  assert.equal(whiskSample(previous,{angle:.4,radius:.8},.4).amount,0);
  assert.equal(whiskSample(null,{angle:.4,radius:.8},.1).amount,0);
});

test('speed and accuracy affect tips while the base drink price stays at 100', () => {
  const r = RECIPES[0], w = newWork(); w.water = r.water;
  const fast = rewardFor(w,r,5), slow = rewardFor(w,r,25);
  assert.ok(fast.tip > slow.tip);
  assert.equal(fast.base,100);
  assert.equal(fast.total,fast.base+fast.tip);
  w.mistakes = 3;
  assert.ok(rewardFor(w,r,5).tip < fast.tip);
  assert.equal(rewardFor(w,r,100).tip,0);
  assert.ok(rewardFor(w,r,0).tip <= 50);
});

test('star boundaries are consistent, with zero stars below the first target', () => {
  for (const [score,stars] of [[0,0],[119,0],[120,1],[299,1],[300,2],[499,2],[500,3],[1000,3]]) {
    assert.equal(starsFor(score),stars);
  }
});

test('all inline JavaScript parses and Cloudflare serves the public directory', () => {
  for (const match of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
  const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  assert.equal(config.pages_build_output_dir, './public');
});
