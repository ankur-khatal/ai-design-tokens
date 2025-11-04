/**
 * Plugin-specific type definitions for communication between
 * Figma plugin main thread and UI
 */

import { TokenCollection, AITokenGenerationRequest, AITokenAnalysis } from './tokens';

// Message types for plugin <-> UI communication
export type PluginMessageType =
  | 'INIT'
  | 'READ_TOKENS_STUDIO'
  | 'READ_TOKENS'
  | 'SAVE_TOKENS'
  | 'APPLY_TOKENS'
  | 'AI_GENERATE'
  | 'AI_ANALYZE'
  | 'AI_SUGGEST'
  | 'SYNC_START'
  | 'SYNC_COMPLETE'
  | 'ERROR';

export interface PluginMessage {
  type: PluginMessageType;
  payload?: any;
}

// Specific message payloads
export interface ReadTokensStudioMessage extends PluginMessage {
  type: 'READ_TOKENS_STUDIO';
}

export interface ReadTokensStudioResponse extends PluginMessage {
  type: 'READ_TOKENS_STUDIO';
  payload: {
    success: boolean;
    tokens?: TokenCollection;
    error?: string;
    source: 'tokens-studio' | 'ai-tokens' | 'none';
  };
}

export interface SaveTokensMessage extends PluginMessage {
  type: 'SAVE_TOKENS';
  payload: {
    tokens: TokenCollection;
    updateTokensStudio?: boolean; // Also update Tokens Studio data
  };
}

export interface ApplyTokensMessage extends PluginMessage {
  type: 'APPLY_TOKENS';
  payload: {
    nodeId: string;
    tokens: {
      [property: string]: string; // property -> token reference
    };
  };
}

export interface AIGenerateMessage extends PluginMessage {
  type: 'AI_GENERATE';
  payload: AITokenGenerationRequest;
}

export interface AIAnalyzeMessage extends PluginMessage {
  type: 'AI_ANALYZE';
  payload: {
    tokens: TokenCollection;
  };
}

export interface AIAnalyzeResponse extends PluginMessage {
  type: 'AI_ANALYZE';
  payload: {
    analysis: AITokenAnalysis;
  };
}

export interface ErrorMessage extends PluginMessage {
  type: 'ERROR';
  payload: {
    message: string;
    details?: any;
  };
}

// Node data structure for storing token references
export interface NodeTokenData {
  appliedTokens: {
    fills?: string[];
    strokes?: string[];
    effects?: string[];
    spacing?: {
      paddingLeft?: string;
      paddingRight?: string;
      paddingTop?: string;
      paddingBottom?: string;
      itemSpacing?: string;
    };
    sizing?: {
      width?: string;
      height?: string;
      minWidth?: string;
      maxWidth?: string;
      minHeight?: string;
      maxHeight?: string;
    };
    typography?: {
      fontFamily?: string;
      fontWeight?: string;
      fontSize?: string;
      lineHeight?: string;
      letterSpacing?: string;
    };
    borderRadius?: {
      topLeft?: string;
      topRight?: string;
      bottomLeft?: string;
      bottomRight?: string;
    };
  };
}
