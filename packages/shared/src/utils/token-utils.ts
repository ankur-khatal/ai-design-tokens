/**
 * Utility functions for working with design tokens
 */

import { Token, TokenSet, TokenCollection, TokenType } from '../types/tokens';

/**
 * Resolve token reference (e.g., {colors.primary} -> actual value)
 */
export function resolveTokenReference(
  reference: string,
  tokenCollection: TokenCollection
): string | null {
  // Remove curly braces if present
  const cleanRef = reference.replace(/[{}]/g, '');

  // Split by dot notation
  const parts = cleanRef.split('.');

  // Navigate through token sets
  let current: any = tokenCollection.values;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }

  // Return the value if we found a token
  if (current && typeof current === 'object' && 'value' in current) {
    const value = current.value;

    // Check if the value itself is a reference
    if (typeof value === 'string' && value.startsWith('{')) {
      return resolveTokenReference(value, tokenCollection);
    }

    return value;
  }

  return null;
}

/**
 * Flatten nested token structure into flat key-value pairs
 */
export function flattenTokens(
  tokenSet: TokenSet,
  prefix: string = ''
): Record<string, Token> {
  const result: Record<string, Token> = {};

  for (const [key, value] of Object.entries(tokenSet)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object') {
      if ('value' in value && 'type' in value) {
        // This is a token
        result[fullKey] = value as Token;
      } else {
        // This is a nested token set
        Object.assign(result, flattenTokens(value as TokenSet, fullKey));
      }
    }
  }

  return result;
}

/**
 * Get all tokens of a specific type
 */
export function getTokensByType(
  tokenCollection: TokenCollection,
  type: TokenType
): Record<string, Token> {
  const result: Record<string, Token> = {};

  for (const [setName, tokenSet] of Object.entries(tokenCollection.values)) {
    const flattened = flattenTokens(tokenSet);

    for (const [key, token] of Object.entries(flattened)) {
      if (token.type === type) {
        result[`${setName}.${key}`] = token;
      }
    }
  }

  return result;
}

/**
 * Validate token value based on type
 */
export function validateTokenValue(value: any, type: TokenType): boolean {
  switch (type) {
    case 'color':
      // Check for hex, rgb, rgba, hsl, hsla
      return typeof value === 'string' && (
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/.test(value) ||
        /^rgb/.test(value) ||
        /^hsl/.test(value)
      );

    case 'dimension':
    case 'spacing':
    case 'borderRadius':
    case 'borderWidth':
    case 'fontSize':
    case 'lineHeight':
    case 'letterSpacing':
      // Check for number with unit or just number
      return typeof value === 'string' && /^\d+(\.\d+)?(px|rem|em|%)?$/.test(value) ||
             typeof value === 'number';

    case 'fontFamily':
      return typeof value === 'string' && value.length > 0;

    case 'fontWeight':
      return (typeof value === 'string' || typeof value === 'number') &&
             (/^\d{3}$/.test(String(value)) || ['normal', 'bold', 'lighter', 'bolder'].includes(String(value)));

    case 'opacity':
      return typeof value === 'number' && value >= 0 && value <= 1 ||
             typeof value === 'string' && /^\d+(\.\d+)?%?$/.test(value);

    default:
      return true; // Allow other types without strict validation
  }
}

/**
 * Parse Tokens Studio data from plugin data string
 */
export function parseTokensStudioData(data: string): TokenCollection | null {
  try {
    const parsed = JSON.parse(data);

    // Tokens Studio stores tokens in different formats
    // Most common: { values: { setName: { tokens } } }
    if (parsed.values) {
      return parsed as TokenCollection;
    }

    // Alternative format: direct token sets
    if (typeof parsed === 'object') {
      return {
        values: parsed,
        usedTokenSet: Object.keys(parsed)
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to parse Tokens Studio data:', error);
    return null;
  }
}

/**
 * Convert token value to Figma-compatible format
 */
export function toFigmaValue(value: string, type: TokenType): any {
  switch (type) {
    case 'color':
      return hexToRgb(value);

    case 'dimension':
    case 'spacing':
    case 'borderRadius':
    case 'borderWidth':
    case 'fontSize':
      return parseFloat(value);

    case 'opacity':
      if (typeof value === 'string' && value.endsWith('%')) {
        return parseFloat(value) / 100;
      }
      return parseFloat(String(value));

    default:
      return value;
  }
}

/**
 * Convert hex color to RGB object for Figma
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace('#', '');

  // Expand shorthand (e.g., "03F" -> "0033FF")
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  if (hex.length !== 6) {
    return null;
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  return { r, g, b };
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
