/**
 * Main plugin code (runs in Figma's main thread)
 *
 * This handles:
 * - Reading Tokens Studio data
 * - Managing our own token storage
 * - Applying tokens to nodes
 * - Communication with UI
 */

import {
  PluginMessage,
  ReadTokensStudioResponse,
  TokenCollection,
} from '@ai-tokens/shared';
import {
  readTokensStudioData,
  readNodeTokenReferences,
  getTokenUsageStats,
} from '../reader/tokens-studio-reader';

// Plugin data keys for our own storage
const AI_TOKENS_KEYS = {
  NAMESPACE: 'ai-design-tokens',
  VALUES: 'values',
  VERSION: '0.1.0',
};

console.log('🚀 AI Design Tokens plugin loaded');

// Show the UI
figma.showUI(__html__, {
  width: 400,
  height: 600,
  title: 'AI Design Tokens',
});

// Handle messages from UI
figma.ui.onmessage = async (msg: PluginMessage) => {
  console.log('📨 Received message:', msg.type);

  try {
    switch (msg.type) {
      case 'INIT':
        await handleInit();
        break;

      case 'READ_TOKENS_STUDIO':
        await handleReadTokensStudio();
        break;

      case 'READ_TOKENS':
        await handleReadTokens();
        break;

      case 'SAVE_TOKENS':
        await handleSaveTokens(msg.payload);
        break;

      case 'APPLY_TOKENS':
        await handleApplyTokens(msg.payload);
        break;

      case 'AI_GENERATE':
        await handleAIGenerate(msg.payload);
        break;

      case 'AI_ANALYZE':
        await handleAIAnalyze(msg.payload);
        break;

      default:
        console.warn('Unknown message type:', msg.type);
    }
  } catch (error) {
    console.error('❌ Error handling message:', error);
    figma.ui.postMessage({
      type: 'ERROR',
      payload: {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
      },
    });
  }
};

/**
 * Initialize plugin - send initial data to UI
 */
async function handleInit() {
  console.log('🎬 Initializing plugin...');

  // Try to read existing tokens (ours or Tokens Studio)
  const tokensStudioResult = await readTokensStudioData();
  const ourTokens = await readOurTokens();

  // Get usage stats
  const stats = getTokenUsageStats();

  figma.ui.postMessage({
    type: 'INIT',
    payload: {
      tokensStudio: tokensStudioResult,
      ourTokens,
      stats,
    },
  });

  console.log('✅ Plugin initialized');
}

/**
 * Read Tokens Studio data
 */
async function handleReadTokensStudio() {
  console.log('📖 Reading Tokens Studio data...');

  const result = await readTokensStudioData();

  const response: ReadTokensStudioResponse = {
    type: 'READ_TOKENS_STUDIO',
    payload: {
      success: result.found,
      tokens: result.tokens,
      error: result.error,
      source: result.source,
    },
  };

  figma.ui.postMessage(response);

  if (result.found) {
    console.log('✅ Successfully read Tokens Studio data');
    console.log(`   Source: ${result.source}`);
    console.log(`   Token sets: ${Object.keys(result.tokens?.values || {}).join(', ')}`);

    // Show notification to user
    figma.notify('✅ Successfully imported Tokens Studio tokens!');
  } else {
    console.log('ℹ️ No Tokens Studio data found');
    figma.notify('No Tokens Studio tokens found in this file');
  }
}

/**
 * Read our own tokens
 */
async function handleReadTokens() {
  const tokens = await readOurTokens();

  figma.ui.postMessage({
    type: 'READ_TOKENS',
    payload: {
      success: !!tokens,
      tokens,
    },
  });
}

/**
 * Save tokens
 */
async function handleSaveTokens(payload: {
  tokens: TokenCollection;
  updateTokensStudio?: boolean;
}) {
  console.log('💾 Saving tokens...');

  // Save to our namespace
  figma.root.setPluginData(
    AI_TOKENS_KEYS.VALUES,
    JSON.stringify(payload.tokens)
  );
  figma.root.setPluginData(AI_TOKENS_KEYS.VERSION, AI_TOKENS_KEYS.VERSION);

  // Optionally also save to Tokens Studio format for compatibility
  if (payload.updateTokensStudio) {
    figma.root.setPluginData('values', JSON.stringify(payload.tokens));
  }

  figma.ui.postMessage({
    type: 'SAVE_TOKENS',
    payload: {
      success: true,
    },
  });

  figma.notify('✅ Tokens saved successfully');
  console.log('✅ Tokens saved');
}

/**
 * Apply tokens to a node
 */
async function handleApplyTokens(payload: {
  nodeId: string;
  tokens: Record<string, string>;
}) {
  const node = figma.getNodeById(payload.nodeId);

  if (!node) {
    throw new Error('Node not found');
  }

  // Store token references on the node
  (node as SceneNode).setPluginData('tokens', JSON.stringify(payload.tokens));

  // TODO: Actually apply the token values to the node
  // This requires resolving token references and setting properties

  figma.notify('✅ Tokens applied to node');
}

/**
 * Generate tokens using AI
 */
async function handleAIGenerate(payload: any) {
  console.log('🤖 Generating tokens with AI...');

  // TODO: Implement AI generation
  // This will call the AI service to generate tokens

  figma.ui.postMessage({
    type: 'AI_GENERATE',
    payload: {
      success: false,
      error: 'AI generation not yet implemented',
    },
  });
}

/**
 * Analyze tokens using AI
 */
async function handleAIAnalyze(payload: any) {
  console.log('🤖 Analyzing tokens with AI...');

  // TODO: Implement AI analysis
  // This will call the AI service to analyze tokens

  figma.ui.postMessage({
    type: 'AI_ANALYZE',
    payload: {
      success: false,
      error: 'AI analysis not yet implemented',
    },
  });
}

/**
 * Read our own stored tokens
 */
async function readOurTokens(): Promise<TokenCollection | null> {
  try {
    const data = figma.root.getPluginData(AI_TOKENS_KEYS.VALUES);
    if (!data) {
      return null;
    }

    return JSON.parse(data) as TokenCollection;
  } catch (error) {
    console.error('Error reading our tokens:', error);
    return null;
  }
}
