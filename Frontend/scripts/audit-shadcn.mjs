import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(process.cwd(), 'src');
const strict = process.argv.includes('--strict');
const extensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.css']);
const codeExtensions = new Set(['.js', '.jsx', '.ts', '.tsx']);

const lineRules = [
  {
    id: 'legacy-tailwind-color',
    pattern: /\b(?:bg|text|border|ring|from|via|to|fill|stroke)-(?:white|black|gray|slate|zinc|neutral|red|orange|amber|yellow|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:\/\d+|-[0-9]{2,3}(?:\/\d+)?)?\b/g,
    message: 'Prefer semantic tokens. Annotate intentional media/QR/data colors with ui-audit-allow and a reason.',
  },
  {
    id: 'arbitrary-color',
    pattern: /\b(?:bg|text|border|ring|fill|stroke)-\[(?:#|rgb|hsl)[^\]]+\]/g,
    message: 'Move reusable colors into semantic theme tokens instead of arbitrary color utilities.',
  },
  {
    id: 'inline-hex-color',
    pattern: /(?:color|backgroundColor|borderColor)\s*:\s*['"]#[0-9a-fA-F]{3,8}['"]/g,
    message: 'Prefer semantic theme tokens for application UI colors.',
    codeOnly: true,
  },
  {
    id: 'literal-css-color',
    pattern: /(?:^|[;{]\s*)(?:color|background(?:-color)?|border(?:-color)?)\s*:\s*#[0-9a-fA-F]{3,8}\b/g,
    message: 'Use theme variables for CSS application colors.',
    cssOnly: true,
  },
  {
    id: 'important-declaration',
    pattern: /!important\b/g,
    message: 'Avoid global cascade overrides; move the rule into the owning primitive or component.',
    cssOnly: true,
  },
  {
    id: 'extreme-z-index',
    pattern: /\bz-\[(?:[1-9]\d{3,})\]/g,
    message: 'Use the shared overlay layering scale instead of an extreme z-index.',
    codeOnly: true,
  },
];

const blockRules = [
  {
    id: 'non-semantic-click-target',
    pattern: /<(?:div|span|p|li|img)\b[^>]*\bonClick\s*=/gs,
    message: 'Use a button or link for interactive content so keyboard and assistive technology behavior is built in.',
  },
  {
    id: 'button-missing-type',
    pattern: /<button\b(?![^>]*\btype\s*=)[^>]*>/gs,
    message: 'Set type="button" for non-submit buttons to avoid accidental form submission.',
  },
  {
    id: 'image-missing-alt',
    pattern: /<img\b(?![^>]*\balt\s*=)[^>]*>/gs,
    message: 'Every image must have an alt attribute; use alt="" for decorative images.',
  },
  {
    id: 'iframe-missing-title',
    pattern: /<iframe\b(?![^>]*\btitle\s*=)[^>]*>/gs,
    message: 'Every iframe needs an accessible title.',
  },
  {
    id: 'unsafe-target-blank',
    pattern: /<a\b(?=[^>]*\btarget\s*=\s*["']_blank["'])(?![^>]*\brel\s*=\s*["'][^"']*(?:noreferrer|noopener))[^>]*>/gs,
    message: 'Links opening a new tab must include rel="noreferrer" or rel="noopener".',
  },
];

const ignoredPaths = [
  `${path.sep}assets${path.sep}`,
  `${path.sep}components${path.sep}Charts${path.sep}`,
];

const isIgnoredFile = (file) => (
  ignoredPaths.some((segment) => file.includes(segment))
  || /\.(?:test|spec)\.[jt]sx?$/.test(file)
);

const files = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (extensions.has(path.extname(entry.name))) files.push(fullPath);
  }
};

const allowPattern = /ui-audit-allow\s*:\s*[^\s].*/i;
const hasAllowance = (lines, zeroBasedLine) => (
  allowPattern.test(lines[zeroBasedLine] || '')
  || allowPattern.test(lines[zeroBasedLine - 1] || '')
);

const lineNumberAt = (content, index) => content.slice(0, index).split(/\r?\n/).length;

walk(root);

const findings = [];
for (const file of files) {
  if (isIgnoredFile(file)) continue;

  const extension = path.extname(file);
  const isCode = codeExtensions.has(extension);
  const isCss = extension === '.css';
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  const relativeFile = path.relative(process.cwd(), file);

  lines.forEach((line, index) => {
    for (const rule of lineRules) {
      if (rule.codeOnly && !isCode) continue;
      if (rule.cssOnly && !isCss) continue;
      rule.pattern.lastIndex = 0;
      for (const match of line.matchAll(rule.pattern)) {
        if (hasAllowance(lines, index)) continue;
        findings.push({
          rule: rule.id,
          file: relativeFile,
          line: index + 1,
          value: match[0].trim(),
          message: rule.message,
        });
      }
    }
  });

  if (!isCode) continue;
  for (const rule of blockRules) {
    rule.pattern.lastIndex = 0;
    for (const match of content.matchAll(rule.pattern)) {
      const line = lineNumberAt(content, match.index || 0);
      if (hasAllowance(lines, line - 1)) continue;
      findings.push({
        rule: rule.id,
        file: relativeFile,
        line,
        value: match[0].replace(/\s+/g, ' ').slice(0, 120),
        message: rule.message,
      });
    }
  }
}

if (findings.length === 0) {
  console.log('UI audit: no unapproved design-system or accessibility findings.');
  process.exit(0);
}

const counts = findings.reduce((summary, finding) => {
  summary[finding.rule] = (summary[finding.rule] || 0) + 1;
  return summary;
}, {});

console.log(`UI audit: ${findings.length} finding(s).\n`);
for (const finding of findings) {
  console.log(`${finding.file}:${finding.line} [${finding.rule}] ${finding.value}`);
  console.log(`  ${finding.message}`);
}

console.log('\nSummary:');
for (const [rule, count] of Object.entries(counts).sort()) {
  console.log(`  ${rule}: ${count}`);
}
console.log('\nReview Frontend/SHADCN_STYLE_GUIDE.md. Use ui-audit-allow only for intentional, documented product/media exceptions.');

if (strict) process.exit(1);
