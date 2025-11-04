# AI Design Tokens

An intelligent design tokens platform that enhances your workflow with AI, compatible with Tokens Studio, and available as both a Figma plugin and web application.

## 🚀 Features

### Core Capabilities
- ✅ **Tokens Studio Compatible**: Read and work with existing Tokens Studio tokens
- 🤖 **AI-Powered**: Generate tokens from natural language, get smart suggestions
- 🌐 **Web + Plugin**: Use in Figma or through our web interface
- 🔄 **Real-time Sync**: Keep tokens synchronized across platforms
- 👥 **Team Collaboration**: Work together on token systems

### AI Features
- **Natural Language Generation**: "Create a primary button with hover state"
- **Smart Suggestions**: Get naming, accessibility, and consistency recommendations
- **Auto Documentation**: Generate comprehensive token documentation
- **Palette Generation**: Create color palettes from descriptions or brand colors
- **Theme Generation**: Automatically generate dark mode and theme variants

### Enhanced Token Management
- **Visual Token Builder**: Drag-and-drop token creation
- **Token Analytics**: Usage insights and optimization suggestions
- **Validation**: WCAG compliance and custom rule checking
- **Git Integration**: Version control for your tokens
- **Multi-brand Support**: Manage tokens across multiple brands

## 📦 Project Structure

```
ai-design-tokens/
├── packages/
│   ├── figma-plugin/       # Figma plugin
│   ├── web-app/            # Web application
│   ├── shared/             # Shared utilities
│   └── ai-service/         # AI integration
└── package.json            # Root config
```

## 🛠️ Development

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Setup

```bash
# Install dependencies
npm install

# Start all packages in dev mode
npm run dev

# Start specific package
npm run plugin:dev    # Figma plugin
npm run web:dev       # Web app
```

### Building

```bash
# Build all packages
npm run build

# Build specific package
npm run plugin:build
npm run web:build
```

## 📚 Documentation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

### Reading Tokens Studio Tokens

Our plugin can read existing Tokens Studio tokens from your Figma files. Tokens are stored using Figma's plugin data API:

```typescript
// Read Tokens Studio data
const tokensData = figma.root.getPluginData('values');
const tokens = JSON.parse(tokensData);
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines (coming soon).

## 📄 License

MIT License - see LICENSE file for details

## 🎯 Roadmap

- [x] Project setup and architecture
- [ ] Basic token CRUD operations
- [ ] Tokens Studio reader implementation
- [ ] AI token generation
- [ ] Web application
- [ ] Real-time sync
- [ ] Team collaboration features
- [ ] Git integration

## 💡 Usage Examples

### AI Token Generation

```
"Create a primary color palette with 5 shades"
→ Generates: primary-50, primary-100, primary-200, primary-300, primary-400

"Add spacing tokens following 8px grid"
→ Generates: spacing-xs (8px), spacing-sm (16px), spacing-md (24px), etc.
```

### Token Analysis

```
Analyze → "You have 3 similar blue colors that could be consolidated"
Suggest → "primary-text-color should be renamed to text-primary for consistency"
Validate → "Warning: contrast ratio of 3.2:1 doesn't meet WCAG AA"
```

## 🔗 Links

- [Tokens Studio Documentation](https://tokens.studio/)
- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [Design Tokens Specification](https://design-tokens.github.io/community-group/format/)

---

Built with ❤️ using AI and modern web technologies
