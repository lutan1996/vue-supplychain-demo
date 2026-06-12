import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const dist = path.join(projectRoot, 'dist');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyRootHtmlAndJs() {
  for (const entry of fs.readdirSync(projectRoot, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const srcPath = path.join(projectRoot, entry.name);
    const ext = path.extname(entry.name).toLowerCase();
    if (entry.isDirectory()) continue;
    if (ext === '.html' || entry.name === 'demo-pages-external.js') {
      const destPath = path.join(dist, entry.name);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Post-build: copying static assets...');
copyDir(path.join(projectRoot, 'assets'), path.join(dist, 'assets'));
copyDir(path.join(projectRoot, 'css'), path.join(dist, 'css'));
copyDir(path.join(projectRoot, 'js'), path.join(dist, 'js'));
copyRootHtmlAndJs();
console.log('Post-build: done.');
