import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(process.cwd(), 'src');
const strict = process.argv.includes('--strict');
const extensions = new Set(['.js', '.jsx', '.ts', '.tsx']);

const rules = [
  {
    id: 'legacy-tailwind-color',
    pattern: /\b(?:bg|text|border|ring|from|via|to)-(?:white|black|gray|slate|zinc|neutral|red|orange|amber|yellow|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:\/\d+|-[0-9]{2,3}(?:\/\d+)?)?\b/g,
    message: 'Prefer semantic Shadcn tokens such as background, foreground, card, muted, primary, destructive, border and ring.',
  },
  {
    id: 'arbitrary-color',
    pattern: /\b(?:bg|text|border|ring)-\[(?:#|rgb|hsl)[^\]]+\]/g,
    message: 'Move reusable colors into semantic theme tokens instead of arbitrary color utilities.',
  },
  {
    id: 'inline-hex-color',
    pattern: /(?:color|backgroundColor|borderColor)\s*:\s*['"]#[0-9a-fA-F]{3,8}['"]/g,
    message: 'Prefer semantic theme tokens for application UI colors.',
  },
];

const ignoredPaths = [
  `${path.sep}assets${path.sep}`,
  `${path.sep}components${path.sep}Charts${path.sep}`,
];

const files = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (extensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
};

walk(root);

const findings = [];
for (const file of files) {
  if (ignoredPaths.some((segment) => file.includes(segment))) continue;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const rule of rules) {
      rule.pattern.lastIndex = 0;
      const matches = [...line.matchAll(rule.pattern)];
      for (const match of matches) {
        findings.push({
          rule: rule.id,
          file: path.relative(process.cwd(), file),
          line: index + 1,
          value: match[0],
          message: rule.message,
        });
      }
    }
  });
}

if (findings.length === 0) {
  console.log('Shadcn audit: no legacy color styling found.');
  process.exit(0);
}

console.log(`Shadcn audit: ${findings.length} legacy styling occurrence(s) found.\n`);
for (const finding of findings) {
  console.log(`${finding.file}:${finding.line} [${finding.rule}] ${finding.value}`);
}
console.log('\nReview Frontend/SHADCN_STYLE_GUIDE.md before changing or suppressing a finding.');

if (strict) process.exit(1);
