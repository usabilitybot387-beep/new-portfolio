import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve('./');
const possibleSrcs = [
  path.join(projectRoot, 'dist', 'client', 'client', 'assets'),
  path.join(projectRoot, 'dist', 'client', 'assets'),
  path.join(projectRoot, 'dist', 'assets'),
];
const dest = path.join(projectRoot, 'public', 'assets');

let found = null;
for (const p of possibleSrcs) {
  if (fs.existsSync(p)) {
    found = p;
    break;
  }
}

if (!found) {
  console.error(`Source assets folder not found. Checked: ${possibleSrcs.join(', ')}`);
  process.exit(1);
}

if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true, force: true });
}

fs.mkdirSync(dest, { recursive: true });
fs.cpSync(found, dest, { recursive: true });
console.log(`Copied ${found} to ${dest}`);
