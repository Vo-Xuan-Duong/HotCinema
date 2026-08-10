import { describe, expect, it } from 'vitest';
import { sanitizeLegacyColorClassName, sanitizeSemanticStyle } from './stylePolicy';

describe('stylePolicy', () => {
  it('removes legacy palette classes while preserving semantic and layout classes', () => {
    expect(
      sanitizeLegacyColorClassName('px-3 text-red-600 bg-white border-gray-200 text-foreground bg-card')
    ).toBe('px-3 text-foreground bg-card');
  });

  it('removes legacy colors behind Tailwind variants and arbitrary colors', () => {
    expect(
      sanitizeLegacyColorClassName(
        'hover:bg-red-500 dark:text-gray-300 focus:ring-blue-500 md:border-[#ff0000] hover:bg-accent text-foreground'
      )
    ).toBe('hover:bg-accent text-foreground');
  });

  it('removes gradient palette stops but preserves semantic classes', () => {
    expect(
      sanitizeLegacyColorClassName('from-red-500 via-orange-500 to-yellow-500 rounded-md bg-primary')
    ).toBe('rounded-md bg-primary');
  });

  it('removes inline color and shadow overrides while preserving layout styles', () => {
    expect(
      sanitizeSemanticStyle({
        color: '#fff',
        backgroundColor: '#000',
        borderColor: '#ddd',
        boxShadow: '0 1px 2px #000',
        width: 120,
        minHeight: 40,
      })
    ).toEqual({ width: 120, minHeight: 40 });
  });
});
