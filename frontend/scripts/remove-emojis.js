#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXCLUDE_DIRS = new Set(['node_modules', '.next', 'out', 'dist', '.git']);
const TEXT_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.sass', '.md', '.json', '.html', '.htm', '.txt', '.yml', '.yaml', '.env', '.svg', '.less']);

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-n');

// Emoji ranges (covers common emoji blocks). Uses Unicode codepoint escapes so Node needs the `u` flag.
const emojiRegex = new RegExp([
  '\\uFE0F',
  '[\\u{1F600}-\\u{1F64F}]',
  '[\\u{1F300}-\\u{1F5FF}]',
  '[\\u{1F680}-\\u{1F6FF}]',
  '[\\u{1F1E6}-\\u{1F1FF}]',
  '[\\u{2600}-\\u{26FF}]',
  '[\\u{2700}-\\u{27BF}]',
  '[\\u{1F900}-\\u{1F9FF}]',
  '[\\u{1FA70}-\\u{1FAFF}]'
].join('|'), 'gu');

let results = [];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (EXCLUDE_DIRS.has(e.name)) continue;
      await walk(full);
      continue;
    }
    if (!e.isFile()) continue;

    // Skip large binary files heuristically by extension
    const ext = path.extname(e.name).toLowerCase();
    if (!TEXT_EXTS.has(ext) && ext && !['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.md', '.svg', '.html'].includes(ext)) {
      // still try to read unknown extensions, but continue if read fails
    }

    try {
      const content = await fs.readFile(full, 'utf8');
      let match;
      let count = 0;
      const samples = new Set();
      while ((match = emojiRegex.exec(content)) !== null) {
        count++;
        if (samples.size < 5) samples.add(match[0]);
      }
      if (count > 0) {
        results.push({ file: full, count, sample: Array.from(samples).join(' ') });
        if (!dryRun) {
          const newContent = content.replace(emojiRegex, '');
          await fs.writeFile(full, newContent, 'utf8');
        }
      }
    } catch (err) {
      // ignore unreadable/binary files
    }
  }
}

(async () => {
  try {
    console.log(dryRun ? 'DRY RUN: listing files with emojis...' : 'Removing emojis from files...');
    await walk(ROOT);
    if (results.length === 0) {
      console.log('No emojis found in frontend files.');
      process.exit(0);
    }
    for (const r of results) {
      console.log(`${dryRun ? '[DRY]' : '[CHANGED]'} ${path.relative(process.cwd(), r.file)} — ${r.count} match(es) — sample: ${r.sample}`);
    }
    console.log(`${results.length} file(s) ${dryRun ? 'would be' : 'were'} modified.`);
  } catch (err) {
    console.error('Error:', err);
    process.exit(2);
  }
})();
