#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readFunction(file, name) {
  const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const signature = `function ${name}(`;
  const start = source.indexOf(signature);
  assert.notEqual(start, -1, `${file} must define ${name}()`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    if (source[i] === '}') depth -= 1;
    if (depth === 0) {
      // The function is deliberately pure and closed over no application state.
      return Function(`"use strict"; return (${source.slice(start, i + 1)});`)();
    }
  }
  throw new Error(`${file}:${name}() has no closing brace`);
}

const hydrated = readFunction('site/app.js', 'solveGuidance');
const server = readFunction('server.js', 'solveGuidance');

const normalizedFunction = (fn) => fn.toString().replace(/\s+/g, ' ').trim();
assert.equal(
  normalizedFunction(hydrated),
  normalizedFunction(server),
  'hydrated and no-JS solveGuidance predicates must remain identical',
);

const corpus = [
  ['chest pain', 'urgent'],
  ['chestpain after exercise', 'urgent'],
  ['chest pains', 'urgent'],
  ['severe chest discomfort', 'urgent'],
  ['I have pain in my chest', 'urgent'],
  ['my chest hurts', 'urgent'],
  ['tightness across the chest', 'urgent'],
  ['I feel suicdal', 'urgent'],
  ['suicidal thoughts', 'urgent'],
  ['self-harming', 'urgent'],
  ['I am thinking about hurting myself', 'urgent'],
  ['I want to end my life', 'urgent'],
  ["I don't want to live", 'urgent'],
  ['I would be better off dead', 'urgent'],
  ['trouble breathing', 'urgent'],
  ['cant breathe', 'urgent'],
  ['hard to breathe', 'urgent'],
  ["can't catch my breath", 'urgent'],
  ['I am breathless', 'urgent'],
  ['unresponsive', 'urgent'],
  ['passed out', 'urgent'],
  ['fainted', 'urgent'],
  ['thunderclap headache', 'urgent'],
  ['sudden slurred speech', 'urgent'],
  ['sudden one-sided weakness', 'urgent'],
  ['numbness down my left side', 'urgent'],
  ['possible overdose', 'urgent'],
  ['pregnant and tired', 'professional_review'],
  ['pregant and tired', 'professional_review'],
  ['pregancy question', 'professional_review'],
  ['pregnet and nauseous', 'professional_review'],
  ['I might be pregenant', 'professional_review'],
  ['warfarin and semaglutide', 'professional_review'],
  ['child sleep problem', 'professional_review'],
  ['medication interaction', 'professional_review'],
  ['combine supplements with medication', 'professional_review'],
  ['can I take creatine with warfarin', 'professional_review'],
  ['use magnesium alongside sertraline', 'professional_review'],
  ['mix caffeine and ephedrine', 'professional_review'],
  ['ibuprofen plus creatine', 'professional_review'],
  ['melatonin and fluoxetine', 'professional_review'],
  ['knee pain on stairs', null],
  ['migraine', null],
  ['brain fog', null],
];

for (const [query, expected] of corpus) {
  assert.equal(hydrated(query), expected, `hydrated route for “${query}”`);
  assert.equal(server(query), expected, `server route for “${query}”`);
}

console.log(`[solve-guidance] ${corpus.length} safety-sensitive and ordinary queries route identically`);
