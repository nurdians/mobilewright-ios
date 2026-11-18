// Explore: tap an element by accessible name, then dump the resulting screen tree.
// Usage: node scripts/explore.mjs "New Order" [outfile]
import { ios } from 'mobilewright';
import { writeFileSync } from 'node:fs';

const actions = process.argv.slice(2).filter((a) => a !== '--dump-only');
const out = '/tmp/mw-tree.json';
const dumpOnly = process.argv.includes('--dump-only');

const device = await ios.launch({ bundleId: 'com.mobilenext.Milliways' });
const screen = device.screen;

async function dump(label) {
  const tree = await screen.viewTree();
  writeFileSync(out, JSON.stringify(tree, null, 2));
  console.log(`--- ${label} → ${out} ---`);
  function walk(nodes, depth = 0) {
    if (depth > 7 || !Array.isArray(nodes)) return;
    for (const n of nodes) {
      const bits = [
        n.type,
        n.label ? `label="${n.label}"` : '',
        n.testId ? `testId="${n.testId}"` : '',
        n.text ? `text="${n.text}"` : '',
      ].filter(Boolean);
      console.log(`${'  '.repeat(depth)}${bits.join(' ')}`);
      walk(n.children, depth + 1);
    }
  }
  walk(tree);
}

if (dumpOnly) {
  await dump('current');
} else {
  for (const target of actions) {
    const locator = screen.getByText(target, { exact: false }).first();
    await locator.tap();
    await new Promise((r) => setTimeout(r, 2000));
  }
  await dump(`after ${actions.map((a) => `"${a}"`).join(' → ')}`);
}

await device.close();
