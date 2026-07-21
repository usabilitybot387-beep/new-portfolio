import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve('./');

// After TanStack Start's Vite build, the client-side JS/CSS assets land in:
//   dist/client/client/assets/
// vercel.json has "outputDirectory": "dist/client/client" so Vercel serves
// static files from there.
//
// However, Vite's publicDir copy lands images in dist/client/client/ for only
// the files that were present at build start. Files added to public/ after the
// initial build scan are missed. We explicitly copy all public/ images here.

const clientAssetsSrc = path.join(projectRoot, 'dist', 'client', 'client', 'assets');
const publicSrc = path.join(projectRoot, 'public');
const clientDist = path.join(projectRoot, 'dist', 'client', 'client');
const publicDest = path.join(projectRoot, 'public', 'assets');

// Image/media extensions to copy from public/ → dist/client/client/
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.avif']);

function copyDirectoryRecursive(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      // Skip the assets sub-folder (already handled by Vite) and node_modules
      if (entry.name === 'assets' || entry.name === 'node_modules') continue;
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

// ─── 1. Copy public/ images → dist/client/client/ (for Vercel) ───────────────
let copiedImages = 0;
for (const entry of fs.readdirSync(publicSrc, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const ext = path.extname(entry.name).toLowerCase();
  if (!IMAGE_EXTS.has(ext)) continue;

  const src = path.join(publicSrc, entry.name);
  const dest = path.join(clientDist, entry.name);
  fs.copyFileSync(src, dest);
  copiedImages++;
  console.log(`[copy-assets] ✓ ${entry.name} → dist/client/client/`);
}
console.log(`[copy-assets] Copied ${copiedImages} public images → dist/client/client/`);

// ─── 2. Copy built JS/CSS assets → public/assets/ (for local vite preview) ──
if (fs.existsSync(publicDest)) {
  fs.rmSync(publicDest, { recursive: true, force: true });
}
copyDirectoryRecursive(clientAssetsSrc, publicDest);
console.log(`[copy-assets] Copied JS/CSS assets → ${publicDest}`);
console.log('[copy-assets] Done. Vercel will serve all assets from dist/client/client/');
