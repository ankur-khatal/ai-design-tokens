# Quick Start Guide

## Getting Started in 5 Minutes

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Figma desktop app (for plugin development)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-design-tokens

# Install dependencies
npm install

# Build all packages
npm run build
```

### Development

#### Figma Plugin

```bash
# Start development mode (watches for changes)
npm run plugin:dev

# Or use workspace command
npm run dev --workspace=@ai-tokens/figma-plugin
```

**Load the plugin in Figma:**

1. Open Figma Desktop App
2. Go to Plugins → Development → Import plugin from manifest
3. Select `packages/figma-plugin/manifest.json`
4. The plugin will appear in your Plugins menu

#### Testing with Tokens Studio

If you have existing Tokens Studio tokens:

1. Open a Figma file with Tokens Studio tokens
2. Open AI Design Tokens plugin
3. Click "📖 Read Tokens Studio Tokens"
4. Your tokens will be imported automatically!

### Project Structure

```
ai-design-tokens/
├── packages/
│   ├── figma-plugin/          # Figma plugin
│   │   ├── src/
│   │   │   ├── plugin/        # Plugin code (main thread)
│   │   │   ├── ui/            # UI code (React)
│   │   │   └── reader/        # Token reader
│   │   └── manifest.json
│   │
│   ├── shared/                # Shared types & utilities
│   │   └── src/
│   │       ├── types/         # TypeScript types
│   │       └── utils/         # Utility functions
│   │
│   └── ai-service/            # AI features
│       └── src/
│           ├── token-generator.ts
│           └── token-analyzer.ts
│
└── package.json
```

## Features Overview

### 🔍 Read Tokens Studio Tokens
Import existing Tokens Studio tokens from any Figma file.

**How it works:**
- Searches for Tokens Studio plugin data
- Supports multiple storage formats
- Reads token references on nodes
- Provides usage statistics

### 🤖 AI Token Generation
Generate tokens using natural language.

**Examples:**
- "Create a primary color palette with 5 shades"
- "Generate spacing tokens following 8px grid"
- "Make a blue button with hover state"

**To use:**
1. Open the plugin
2. Enter your prompt in the AI Generation section
3. Click "🤖 Generate with AI"
4. Review and apply the generated tokens

### 📊 Token Analysis
Get intelligent suggestions for improving your tokens.

**What it checks:**
- Duplicate or similar tokens
- Naming inconsistencies
- Accessibility issues (WCAG)
- Optimization opportunities

### 🎨 Visual Token Management
Browse and manage your tokens with a beautiful UI.

**Features:**
- Color previews
- Token type badges
- Nested token groups
- Search and filter (coming soon)

## Working with Tokens

### Reading Tokens

```typescript
// In plugin code
import { readTokensStudioData } from './reader/tokens-studio-reader';

const result = await readTokensStudioData();
if (result.found) {
  console.log('Tokens:', result.tokens);
}
```

### Generating Tokens with AI

```typescript
// In AI service
import { TokenGenerator } from '@ai-tokens/ai-service';

const generator = new TokenGenerator(apiKey);
const response = await generator.generate({
  prompt: 'Create a primary color palette',
  context: {
    existingTokens: currentTokens
  }
});

console.log('Generated tokens:', response.tokens);
console.log('Explanation:', response.explanation);
```

### Analyzing Tokens

```typescript
import { TokenAnalyzer } from '@ai-tokens/ai-service';

const analyzer = new TokenAnalyzer(apiKey);
const analysis = await analyzer.analyze(tokens);

console.log('Issues found:', analysis.namingIssues);
console.log('Suggestions:', analysis.optimizations);
```

## Environment Setup

### For AI Features

Create a `.env` file in the project root:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

Get your API key from: https://console.anthropic.com/

### For Development

The plugin uses hot reloading during development:

1. Run `npm run plugin:dev`
2. Make changes to the code
3. Reload the plugin in Figma (Right-click plugin → "Reload plugin")

## Common Tasks

### Building for Production

```bash
# Build all packages
npm run build

# Build specific package
npm run plugin:build
```

### Cleaning Build Artifacts

```bash
# Clean all packages
npm run clean
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific package tests
npm test --workspace=@ai-tokens/shared
```

## Architecture

### Figma Plugin Architecture

```
┌─────────────────────────────────────┐
│         Figma Plugin                │
├─────────────────────────────────────┤
│  UI (React)          │  Plugin Code │
│  - Components        │  - Token Reader│
│  - Token Display     │  - Message Handler│
│  - AI Interface      │  - Token Applier│
└──────────┬───────────┴──────┬───────┘
           │                  │
           │  postMessage     │
           ├──────────────────┤
           │                  │
      ┌────▼──────────────────▼────┐
      │     Figma Plugin Data       │
      │  - Tokens Studio data       │
      │  - AI Tokens data           │
      │  - Node references          │
      └─────────────────────────────┘
```

### Data Flow

1. **Reading Tokens**
   - Plugin reads from Figma Plugin Data API
   - Parser converts to TokenCollection format
   - UI displays tokens

2. **AI Generation**
   - User enters prompt in UI
   - UI sends message to plugin
   - Plugin calls AI service
   - AI returns generated tokens
   - Plugin saves and UI updates

3. **Token Application**
   - User selects tokens to apply
   - Plugin resolves token references
   - Plugin updates node properties
   - Plugin stores references in node plugin data

## Troubleshooting

### Plugin Not Loading

1. Check manifest.json path is correct
2. Ensure all dependencies are installed
3. Run `npm run plugin:build`
4. Try restarting Figma

### AI Features Not Working

1. Check ANTHROPIC_API_KEY is set
2. Verify API key is valid
3. Check network connection
4. Look at browser console for errors

### Tokens Not Reading

1. Ensure Tokens Studio has saved tokens
2. Check token storage type is "local"
3. Try opening Tokens Studio first
4. Check console for error messages

### Build Errors

1. Clear node_modules: `rm -rf node_modules`
2. Clear build artifacts: `npm run clean`
3. Reinstall: `npm install`
4. Rebuild: `npm run build`

## Next Steps

1. **Explore the Code**
   - Check out the token reader in `packages/figma-plugin/src/reader/`
   - Look at AI services in `packages/ai-service/src/`
   - Review shared types in `packages/shared/src/types/`

2. **Read the Documentation**
   - [Architecture Documentation](./ARCHITECTURE.md)
   - [Tokens Studio Integration](./TOKENS_STUDIO_INTEGRATION.md)

3. **Try the Examples**
   - Import existing Tokens Studio tokens
   - Generate tokens with AI
   - Analyze your token system

4. **Contribute**
   - Report issues on GitHub
   - Submit pull requests
   - Share your token systems

## Resources

- [Figma Plugin API Docs](https://www.figma.com/plugin-docs/)
- [Tokens Studio Documentation](https://tokens.studio/)
- [Design Tokens Spec](https://design-tokens.github.io/community-group/format/)
- [Anthropic Claude API](https://docs.anthropic.com/)

## Need Help?

- Open an issue on GitHub
- Check existing documentation
- Review code examples
- Join our community (coming soon)

---

Happy token designing! 🎨✨
