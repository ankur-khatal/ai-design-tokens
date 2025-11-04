/**
 * Tokens Studio Reader
 *
 * This module reads design tokens stored by Tokens Studio plugin in Figma.
 * Tokens Studio stores data using Figma's pluginData API with specific keys.
 */

import { TokenCollection, TokensStudioData } from '@ai-tokens/shared';
import { parseTokensStudioData } from '@ai-tokens/shared';

// Known plugin data keys used by Tokens Studio
const TOKENS_STUDIO_KEYS = {
  // Main namespace used by Tokens Studio
  NAMESPACE: 'tokens-studio',

  // Specific keys within the namespace
  VALUES: 'values',
  VERSION: 'version',
  UPDATED_AT: 'updatedAt',
  STORAGE_TYPE: 'storageType',

  // Legacy keys (older versions)
  LEGACY_VALUES: 'tokenValues',
};

export interface TokensStudioReadResult {
  found: boolean;
  tokens?: TokenCollection;
  source: 'tokens-studio' | 'legacy' | 'none';
  version?: string;
  storageType?: string;
  error?: string;
}

/**
 * Read Tokens Studio data from the Figma document
 *
 * Tokens Studio stores tokens in multiple ways:
 * 1. As shared plugin data on the document root (for team sharing)
 * 2. As regular plugin data on the document root (for local storage)
 * 3. Legacy format in older versions
 */
export async function readTokensStudioData(): Promise<TokensStudioReadResult> {
  try {
    console.log('🔍 Searching for Tokens Studio data...');

    // Try to read from shared plugin data first (team sharing)
    const sharedData = await readFromSharedPluginData();
    if (sharedData.found) {
      console.log('✅ Found Tokens Studio data in shared plugin data');
      return sharedData;
    }

    // Try to read from regular plugin data
    const regularData = await readFromPluginData();
    if (regularData.found) {
      console.log('✅ Found Tokens Studio data in plugin data');
      return regularData;
    }

    // Try legacy format
    const legacyData = await readFromLegacyFormat();
    if (legacyData.found) {
      console.log('✅ Found Tokens Studio data in legacy format');
      return legacyData;
    }

    console.log('ℹ️ No Tokens Studio data found');
    return {
      found: false,
      source: 'none',
    };
  } catch (error) {
    console.error('❌ Error reading Tokens Studio data:', error);
    return {
      found: false,
      source: 'none',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Read from shared plugin data (for team sharing)
 */
async function readFromSharedPluginData(): Promise<TokensStudioReadResult> {
  try {
    // Tokens Studio uses a specific namespace for shared data
    const valuesData = figma.root.getSharedPluginData(
      TOKENS_STUDIO_KEYS.NAMESPACE,
      TOKENS_STUDIO_KEYS.VALUES
    );

    if (!valuesData) {
      return { found: false, source: 'none' };
    }

    // Parse the token data
    const tokens = parseTokensStudioData(valuesData);
    if (!tokens) {
      return {
        found: false,
        source: 'none',
        error: 'Failed to parse Tokens Studio data',
      };
    }

    // Read additional metadata
    const version = figma.root.getSharedPluginData(
      TOKENS_STUDIO_KEYS.NAMESPACE,
      TOKENS_STUDIO_KEYS.VERSION
    );
    const storageType = figma.root.getSharedPluginData(
      TOKENS_STUDIO_KEYS.NAMESPACE,
      TOKENS_STUDIO_KEYS.STORAGE_TYPE
    );

    return {
      found: true,
      tokens,
      source: 'tokens-studio',
      version: version || undefined,
      storageType: storageType || undefined,
    };
  } catch (error) {
    return { found: false, source: 'none' };
  }
}

/**
 * Read from regular plugin data (local storage)
 */
async function readFromPluginData(): Promise<TokensStudioReadResult> {
  try {
    // Try the main namespace key
    const valuesData = figma.root.getPluginData(TOKENS_STUDIO_KEYS.VALUES);

    if (!valuesData) {
      return { found: false, source: 'none' };
    }

    // Parse the token data
    const tokens = parseTokensStudioData(valuesData);
    if (!tokens) {
      return {
        found: false,
        source: 'none',
        error: 'Failed to parse Tokens Studio data',
      };
    }

    // Read additional metadata
    const version = figma.root.getPluginData(TOKENS_STUDIO_KEYS.VERSION);
    const storageType = figma.root.getPluginData(TOKENS_STUDIO_KEYS.STORAGE_TYPE);

    return {
      found: true,
      tokens,
      source: 'tokens-studio',
      version: version || undefined,
      storageType: storageType || undefined,
    };
  } catch (error) {
    return { found: false, source: 'none' };
  }
}

/**
 * Read from legacy Tokens Studio format
 */
async function readFromLegacyFormat(): Promise<TokensStudioReadResult> {
  try {
    const legacyData = figma.root.getPluginData(TOKENS_STUDIO_KEYS.LEGACY_VALUES);

    if (!legacyData) {
      return { found: false, source: 'none' };
    }

    const tokens = parseTokensStudioData(legacyData);
    if (!tokens) {
      return { found: false, source: 'none' };
    }

    return {
      found: true,
      tokens,
      source: 'legacy',
    };
  } catch (error) {
    return { found: false, source: 'none' };
  }
}

/**
 * Read token references applied to a specific node
 * Tokens Studio stores applied tokens in node plugin data
 */
export function readNodeTokenReferences(node: SceneNode): Record<string, any> | null {
  try {
    const tokenData = node.getPluginData('tokens');
    if (!tokenData) {
      return null;
    }

    return JSON.parse(tokenData);
  } catch (error) {
    console.error('Error reading node token references:', error);
    return null;
  }
}

/**
 * Get all nodes in the document that have token references applied
 */
export function* findNodesWithTokens(): Generator<SceneNode> {
  function* traverse(node: BaseNode): Generator<SceneNode> {
    if ('children' in node) {
      for (const child of node.children) {
        yield* traverse(child);
      }
    }

    if ('getPluginData' in node) {
      const tokenData = (node as SceneNode).getPluginData('tokens');
      if (tokenData) {
        yield node as SceneNode;
      }
    }
  }

  yield* traverse(figma.root);
}

/**
 * Get statistics about token usage in the document
 */
export function getTokenUsageStats(): {
  totalNodes: number;
  nodesWithTokens: number;
  uniqueTokensUsed: Set<string>;
} {
  let totalNodes = 0;
  let nodesWithTokens = 0;
  const uniqueTokensUsed = new Set<string>();

  for (const node of findNodesWithTokens()) {
    nodesWithTokens++;
    const tokenRefs = readNodeTokenReferences(node);

    if (tokenRefs) {
      // Extract token references from the data
      Object.values(tokenRefs).forEach(value => {
        if (typeof value === 'string' && value.startsWith('{')) {
          uniqueTokensUsed.add(value);
        }
      });
    }
  }

  // Count total nodes
  function countNodes(node: BaseNode): void {
    totalNodes++;
    if ('children' in node) {
      for (const child of node.children) {
        countNodes(child);
      }
    }
  }
  countNodes(figma.root);

  return {
    totalNodes,
    nodesWithTokens,
    uniqueTokensUsed,
  };
}
