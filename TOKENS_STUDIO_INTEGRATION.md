# Tokens Studio Integration Guide

## Overview

This plugin can **read and work with existing Tokens Studio tokens** from your Figma files. This means you can:
- Import your existing token systems
- Continue using Tokens Studio alongside our AI features
- Migrate gradually from Tokens Studio to our enhanced platform
- Keep your tokens compatible with both systems

## How Tokens Studio Stores Data

Tokens Studio stores design tokens in Figma using the Plugin Data API. Understanding this helps explain how our reader works.

### Storage Locations

1. **Document Root Plugin Data**
   - Key: `values` - Contains the entire token collection
   - Key: `version` - Plugin version
   - Key: `storageType` - Storage method (local, url, github, etc.)

2. **Shared Plugin Data** (for team sharing)
   - Namespace: `tokens-studio`
   - Same keys as above, but accessible to team members

3. **Node Plugin Data** (token references)
   - Key: `tokens` - Applied token references on individual nodes
   - Format: `{ "fills": ["{colors.primary}"], ... }`

### Data Format

```json
{
  "values": {
    "global": {
      "colors": {
        "primary": {
          "value": "#0066FF",
          "type": "color",
          "description": "Primary brand color"
        }
      },
      "spacing": {
        "small": {
          "value": "8",
          "type": "spacing"
        }
      }
    },
    "dark-mode": {
      "colors": {
        "background": {
          "value": "#1a1a1a",
          "type": "color"
        }
      }
    }
  },
  "usedTokenSet": ["global", "dark-mode"],
  "$themes": [
    {
      "id": "light",
      "name": "Light Theme",
      "selectedTokenSets": {
        "global": "enabled",
        "dark-mode": "disabled"
      }
    }
  ]
}
```

## Reading Tokens Studio Data

### Using the Plugin UI

1. **Open the Plugin**
   - Open your Figma file that has Tokens Studio tokens
   - Go to Plugins → AI Design Tokens

2. **Import Tokens**
   - Click "📖 Read Tokens Studio Tokens"
   - The plugin will search for and import any Tokens Studio data
   - You'll see a success message if tokens are found

3. **View Imported Tokens**
   - Tokens will appear in the "Token Sets" section
   - Each token shows its name, value, and type
   - Color tokens display a visual preview

### Programmatic Access

The token reader is available in the plugin code:

```typescript
import { readTokensStudioData } from './reader/tokens-studio-reader';

// Read Tokens Studio data
const result = await readTokensStudioData();

if (result.found) {
  console.log('Found tokens:', result.tokens);
  console.log('Source:', result.source);
  console.log('Token sets:', Object.keys(result.tokens.values));
}
```

### What the Reader Does

The `readTokensStudioData()` function:

1. **Searches multiple locations**:
   - Shared plugin data (team sharing)
   - Regular plugin data (local storage)
   - Legacy format (older versions)

2. **Returns detailed information**:
   ```typescript
   {
     found: boolean;
     tokens?: TokenCollection;
     source: 'tokens-studio' | 'legacy' | 'none';
     version?: string;
     storageType?: string;
     error?: string;
   }
   ```

3. **Parses and validates** the token data

## Reading Node Token References

You can also read which tokens are applied to specific nodes:

```typescript
import { readNodeTokenReferences } from './reader/tokens-studio-reader';

// Get tokens applied to a node
const node = figma.currentPage.selection[0];
const appliedTokens = readNodeTokenReferences(node);

console.log(appliedTokens);
// Example output:
// {
//   "fills": ["{colors.primary}"],
//   "borderRadius": "{borderRadius.medium}"
// }
```

## Getting Token Usage Statistics

Find out how tokens are being used in your document:

```typescript
import { getTokenUsageStats } from './reader/tokens-studio-reader';

const stats = getTokenUsageStats();

console.log(`Total nodes: ${stats.totalNodes}`);
console.log(`Nodes with tokens: ${stats.nodesWithTokens}`);
console.log(`Unique tokens used: ${stats.uniqueTokensUsed.size}`);
```

## Finding All Nodes with Tokens

Iterate through all nodes that have token references:

```typescript
import { findNodesWithTokens } from './reader/tokens-studio-reader';

for (const node of findNodesWithTokens()) {
  console.log(`Node "${node.name}" has tokens applied`);
  const tokens = readNodeTokenReferences(node);
  console.log(tokens);
}
```

## Compatibility Features

### Two-Way Compatibility

Our plugin maintains compatibility with Tokens Studio:

1. **Read Tokens Studio Data**: Import existing tokens
2. **Write Tokens Studio Format**: Optionally save in TS format
3. **Preserve Structure**: Keep token sets and themes intact
4. **Token References**: Work with existing node references

### Saving in Tokens Studio Format

When saving tokens, you can optionally update the Tokens Studio data:

```typescript
// In the plugin code
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'SAVE_TOKENS') {
    // Save to our format
    figma.root.setPluginData('values', JSON.stringify(msg.payload.tokens));

    // ALSO save to Tokens Studio format for compatibility
    if (msg.payload.updateTokensStudio) {
      figma.root.setPluginData('values', JSON.stringify(msg.payload.tokens));
    }
  }
};
```

## Migration Strategies

### Gradual Migration

1. **Phase 1: Import**
   - Read existing Tokens Studio tokens
   - Keep using Tokens Studio for now
   - Start experimenting with AI features

2. **Phase 2: Hybrid**
   - Use AI to enhance your token system
   - Save in both formats
   - Team can use either plugin

3. **Phase 3: Full Migration**
   - Switch entirely to AI Design Tokens
   - Remove Tokens Studio dependency
   - Enjoy enhanced AI features

### Full Migration

If you want to fully migrate:

1. **Backup Your Tokens**
   ```
   - Export from Tokens Studio
   - Save JSON file
   ```

2. **Import to AI Design Tokens**
   - Use "Read Tokens Studio Tokens"
   - Verify all tokens imported correctly

3. **Test Thoroughly**
   - Check all token sets
   - Verify node references
   - Test theme switching

4. **Save in New Format**
   - Save without Tokens Studio compatibility
   - Cleaner data structure
   - Full AI features enabled

## Advanced Usage

### Custom Token Parsing

If you have a custom token format, you can extend the parser:

```typescript
import { parseTokensStudioData } from '@ai-tokens/shared';

const customData = figma.root.getPluginData('custom-tokens');
const tokens = parseTokensStudioData(customData);
```

### Token Resolution

Resolve token references to actual values:

```typescript
import { resolveTokenReference } from '@ai-tokens/shared';

const tokens = await readTokensStudioData();
if (tokens.found) {
  const value = resolveTokenReference('{colors.primary}', tokens.tokens);
  console.log(value); // "#0066FF"
}
```

### Filtering by Token Type

Get all tokens of a specific type:

```typescript
import { getTokensByType } from '@ai-tokens/shared';

const tokens = await readTokensStudioData();
if (tokens.found) {
  const colorTokens = getTokensByType(tokens.tokens, 'color');
  console.log(colorTokens);
}
```

## Troubleshooting

### No Tokens Found

If the reader doesn't find tokens:

1. **Check Tokens Studio is installed**
   - Ensure Tokens Studio plugin is installed
   - Open it once to initialize data

2. **Verify token storage**
   - Open Tokens Studio
   - Check that tokens are visible
   - Try changing storage type to "local"

3. **Check permissions**
   - Some storage types require network access
   - Local storage works best

### Incomplete Token Import

If some tokens are missing:

1. **Check token sets**
   - Tokens Studio uses multiple sets
   - Ensure all sets are enabled

2. **Verify data format**
   - Some custom token types may not parse correctly
   - Check console for errors

3. **Update Tokens Studio**
   - Older versions may use different formats
   - Update to latest version

### Token References Not Working

If node references don't resolve:

1. **Check reference format**
   - Must be `{set.token.path}`
   - Case sensitive

2. **Verify token exists**
   - Token must be defined in values

3. **Check token set activation**
   - Token set must be in `usedTokenSet` array

## Best Practices

1. **Always Backup**
   - Export tokens before major changes
   - Keep version history

2. **Test Before Migrating**
   - Try on a copy of your file first
   - Verify all features work

3. **Use Semantic Names**
   - Makes AI suggestions more accurate
   - Easier to manage long-term

4. **Document Your Tokens**
   - Add descriptions to important tokens
   - Helps team understand usage

## Code Examples

### Complete Import Example

```typescript
import {
  readTokensStudioData,
  getTokenUsageStats,
} from './reader/tokens-studio-reader';

async function importTokensStudio() {
  console.log('🔍 Searching for Tokens Studio data...');

  // Read tokens
  const result = await readTokensStudioData();

  if (!result.found) {
    console.log('❌ No Tokens Studio data found');
    return null;
  }

  console.log('✅ Found Tokens Studio data');
  console.log(`   Source: ${result.source}`);
  console.log(`   Version: ${result.version || 'unknown'}`);

  // Get statistics
  const stats = getTokenUsageStats();
  console.log(`   ${stats.nodesWithTokens} nodes using tokens`);
  console.log(`   ${stats.uniqueTokensUsed.size} unique tokens`);

  // List token sets
  const tokenSets = Object.keys(result.tokens.values);
  console.log(`   Token sets: ${tokenSets.join(', ')}`);

  return result.tokens;
}
```

### Save to Both Formats

```typescript
async function saveTokens(tokens: TokenCollection) {
  // Save to our format
  figma.root.setPluginData(
    'ai-design-tokens-values',
    JSON.stringify(tokens)
  );

  // Also save to Tokens Studio format for compatibility
  figma.root.setPluginData(
    'values',
    JSON.stringify(tokens)
  );

  console.log('✅ Saved to both formats');
}
```

## Summary

Yes, we can **definitely read Tokens Studio tokens**! Our plugin:

✅ Reads all Tokens Studio token data
✅ Parses multiple storage formats
✅ Reads token references on nodes
✅ Provides usage statistics
✅ Maintains compatibility
✅ Supports gradual migration

The token reader is fully functional and ready to import your existing Tokens Studio tokens into our AI-enhanced platform.
