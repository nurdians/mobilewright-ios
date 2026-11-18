// Dump the accessibility tree of the app under test for locator verification.
// Usage: node scripts/inspect.mjs [output.json]
import { ios } from 'mobilewright';
import { writeFileSync } from 'node:fs';

const out = process.argv[2] ?? '/tmp/mw-tree.json';

const device = await ios.launch({ bundleId: 'com.mobilenext.Milliways' });
const tree = await device.screen.viewTree();
writeFileSync(out, JSON.stringify(tree, null, 2));

// Compact summary: type, label, testId, text (depth-limited)
function walk(nodes, depth = 0) {
  if (depth > 6 || !Array.isArray(nodes)) return;
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
await device.close();
