import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve('./');

// After TanStack Start's Vite build, the client-side JS/CSS assets land in:
//   dist/client/client/assets/
// vercel.json has "outputDirectory": "dist/client/client" so Vercel serves
// static files from there — the assets are already in the right place.
//
// We still copy them to public/assets/ so `vite preview` works locally.

const clientAssetsSrc = path.join(projectRoot, 'dist', 'client', 'client', 'assets');
const publicDest = path.join(projectRoot, 'public', 'assets');

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

if (!fs.existsSync(clientAssetsSrc)) {
  console.error(`Client assets not found at: ${clientAssetsSrc}`);
  console.error('Run "npm run build" first.');
  process.exit(1);
}

// Copy to public/assets/ for local `vite preview`
if (fs.existsSync(publicDest)) {
  fs.rmSync(publicDest, { recursive: true, force: true });
}
copyDirectoryRecursive(clientAssetsSrc, publicDest);
console.log(`[copy-assets] Copied assets → ${publicDest}`);
console.log('[copy-assets] Done. Vercel will serve assets directly from dist/client/client/assets/');
