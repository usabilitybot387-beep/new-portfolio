import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve('./');
const possibleSrcs = [
  path.join(projectRoot, 'dist', 'client', 'client', 'assets'),
  path.join(projectRoot, 'dist', 'client', 'assets'),
  path.join(projectRoot, 'dist', 'assets'),
];
// Copy to both locations: public/ for local dev, dist/client/ for Vercel production
const publicDest = path.join(projectRoot, 'public', 'assets');
const distDest = path.join(projectRoot, 'dist', 'client', 'assets');

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

// Clean and copy to public/ for local development
if (fs.existsSync(publicDest)) {
  fs.rmSync(publicDest, { recursive: true, force: true });
}
copyDirectoryRecursive(found, publicDest);
console.log(`Copied ${found} to ${publicDest}`);

// Clean and copy to dist/client/ for Vercel production deployment
if (fs.existsSync(distDest)) {
  fs.rmSync(distDest, { recursive: true, force: true });
}
copyDirectoryRecursive(found, distDest);
console.log(`Copied ${found} to ${distDest}`);
