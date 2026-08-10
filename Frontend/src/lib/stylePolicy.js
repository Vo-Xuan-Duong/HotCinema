const LEGACY_COLOR_CLASS = /^(?:bg|text|border|ring|from|via|to)-(?:white|black|gray|slate|zinc|neutral|red|orange|amber|yellow|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})?(?:\/\d+)?$/;

const SEMANTIC_COLOR_STYLE_KEYS = new Set([
  'color',
  'background',
  'backgroundColor',
  'border',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'boxShadow',
]);

export const sanitizeLegacyColorClassName = (className) => className
  ?.split(/\s+/)
  .filter(Boolean)
  .filter((token) => !LEGACY_COLOR_CLASS.test(token))
  .join(' ');

export const sanitizeSemanticStyle = (style) => {
  if (!style) return undefined;

  return Object.fromEntries(
    Object.entries(style).filter(([key]) => !SEMANTIC_COLOR_STYLE_KEYS.has(key))
  );
};
