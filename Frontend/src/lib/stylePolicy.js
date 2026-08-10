const LEGACY_COLOR_CLASS = /^(?:bg|text|border|ring|from|via|to)-(?:white|black|gray|slate|zinc|neutral|red|orange|amber|yellow|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})?(?:\/\d+)?$/;
const ARBITRARY_COLOR_CLASS = /^(?:bg|text|border|ring|from|via|to)-\[(?:#|rgb|hsl|oklch|color:)[^\]]+\]$/i;

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

const isLegacyColorToken = (token) => {
  const utility = token.split(':').at(-1);
  return LEGACY_COLOR_CLASS.test(utility) || ARBITRARY_COLOR_CLASS.test(utility);
};

export const sanitizeLegacyColorClassName = (className) => className
  ?.split(/\s+/)
  .filter(Boolean)
  .filter((token) => !isLegacyColorToken(token))
  .join(' ');

export const sanitizeSemanticStyle = (style) => {
  if (!style) return undefined;

  return Object.fromEntries(
    Object.entries(style).filter(([key]) => !SEMANTIC_COLOR_STYLE_KEYS.has(key))
  );
};
