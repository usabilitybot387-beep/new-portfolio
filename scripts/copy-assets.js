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

function copyDirectoryRecursive(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true, force: true });
}

copyDirectoryRecursive(found, dest);
console.log(`Copied ${found} to ${dest}`);
