/**
 * Design token type definitions
 * Compatible with Tokens Studio and W3C Design Tokens Community Group format
 */

// Token types supported
export type TokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'fontSize'
  | 'lineHeight'
  | 'letterSpacing'
  | 'spacing'
  | 'borderRadius'
  | 'borderWidth'
  | 'opacity'
  | 'boxShadow'
  | 'typography'
  | 'composition'
  | 'asset'
  | 'other';

// Base token interface
export interface Token {
  value: string | number | object;
  type: TokenType;
  description?: string;
  extensions?: Record<string, any>;
}

// Token with metadata
export interface TokenWithMetadata extends Token {
  $extensions?: {
    'studio.tokens'?: {
      modify?: {
        type: string;
        value: string;
        space?: string;
      };
    };
  };
}

// Color token
export interface ColorToken extends Token {
  type: 'color';
  value: string;
}

// Dimension token (spacing, sizing, etc.)
export interface DimensionToken extends Token {
  type: 'dimension' | 'spacing' | 'borderRadius' | 'borderWidth';
  value: string;
}

// Typography token
export interface TypographyToken extends Token {
  type: 'typography';
  value: {
    fontFamily: string;
    fontWeight: string | number;
    fontSize: string;
    lineHeight: string;
    letterSpacing?: string;
  };
}

// Shadow token
export interface ShadowToken extends Token {
  type: 'boxShadow';
  value: {
    x: string;
    y: string;
    blur: string;
    spread: string;
    color: string;
  } | Array<{
    x: string;
    y: string;
    blur: string;
    spread: string;
    color: string;
  }>;
}

// Token set (collection of tokens)
export interface TokenSet {
  [key: string]: Token | TokenSet;
}

// Complete token collection with metadata
export interface TokenCollection {
  values: {
    [setName: string]: TokenSet;
  };
  usedTokenSet?: string[];
  $themes?: Theme[];
  $metadata?: {
    tokenSetOrder?: string[];
  };
}

// Theme definition
export interface Theme {
  id: string;
  name: string;
  selectedTokenSets: {
    [setName: string]: 'enabled' | 'disabled' | 'source';
  };
  $figmaStyleReferences?: Record<string, string>;
}

// Tokens Studio storage format
export interface TokensStudioData {
  values: string; // Stringified JSON of TokenCollection
  version?: string;
  updatedAt?: string;
  storageType?: 'local' | 'url' | 'github' | 'gitlab' | 'jsonbin' | 'generic';
}

// AI-related types

export interface AITokenGenerationRequest {
  prompt: string;
  context?: {
    existingTokens?: TokenCollection;
    brand?: {
      colors?: string[];
      fonts?: string[];
    };
  };
  options?: {
    tokenType?: TokenType;
    count?: number;
    format?: 'tokens-studio' | 'w3c';
  };
}

export interface AITokenGenerationResponse {
  tokens: TokenSet;
  explanation: string;
  suggestions?: string[];
}

export interface AITokenAnalysis {
  duplicates?: {
    tokens: string[];
    suggestion: string;
  }[];
  namingIssues?: {
    token: string;
    issue: string;
    suggestion: string;
  }[];
  accessibilityIssues?: {
    token: string;
    issue: string;
    wcagLevel: 'A' | 'AA' | 'AAA';
  }[];
  optimizations?: {
    description: string;
    impact: 'low' | 'medium' | 'high';
  }[];
}

export interface AITokenSuggestion {
  type: 'naming' | 'consolidation' | 'accessibility' | 'organization';
  token: string;
  currentValue: any;
  suggestedValue?: any;
  reason: string;
  autoApply: boolean;
}
