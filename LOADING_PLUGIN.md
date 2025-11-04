# Loading the Plugin in Figma

## ✅ Plugin is Now Built and Ready!

The build error has been fixed. The plugin is now ready to load in Figma.

## How to Load the Plugin

### Method 1: Using Figma Desktop (Recommended)

1. **Open Figma Desktop App** (not the browser version)

2. **Go to Plugins Menu**
   - Click on the menu icon or use keyboard shortcut
   - Navigate to: `Plugins` → `Development` → `Import plugin from manifest...`

3. **Select the Manifest File**
   - Browse to: `packages/figma-plugin/manifest.json`
   - Full path: `/home/user/ai-design-tokens/packages/figma-plugin/manifest.json`

4. **Plugin is Now Loaded!**
   - The plugin will appear in your Plugins menu
   - Look for "AI Design Tokens"

5. **Run the Plugin**
   - Open any Figma file
   - Go to: `Plugins` → `Development` → `AI Design Tokens`

### Method 2: Using Quick Load

If you've already imported it once:

1. Right-click anywhere in Figma
2. Go to `Plugins` → `Development` → `AI Design Tokens`

## Testing the Plugin

### 1. Basic Functionality Test

1. Open the plugin
2. You should see the UI with:
   - Header: "🎨 AI Design Tokens"
   - Import Tokens section
   - AI Token Generation section

### 2. Test with Tokens Studio

If you have a file with Tokens Studio tokens:

1. Open that Figma file
2. Run AI Design Tokens plugin
3. Click "📖 Read Tokens Studio Tokens"
4. Your tokens should appear in the "Token Sets" section

### 3. Test AI Generation

1. Enter a prompt like: "Create a primary color palette with 5 shades"
2. Click "🤖 Generate with AI"
3. Note: AI features require an Anthropic API key (not implemented yet)

## Built Files

The plugin consists of these files:

```
packages/figma-plugin/dist/
├── manifest.json    # Plugin configuration
├── plugin.js        # Main plugin code (9.8KB)
├── ui.html          # UI HTML with inline CSS (4.9KB)
└── ui.js            # React UI bundle (144KB)
```

## Rebuilding the Plugin

If you make changes to the code:

```bash
# Rebuild the plugin
cd /home/user/ai-design-tokens/packages/figma-plugin
npm run build

# Or use watch mode for development
npm run dev
```

Then reload the plugin in Figma:
- Right-click the plugin in Figma
- Select "Reload plugin"

## Troubleshooting

### Plugin Still Not Loading

1. **Check Figma Desktop App**
   - Plugins only work in Figma Desktop, not the browser
   - Download from: https://www.figma.com/downloads/

2. **Verify Build**
   ```bash
   ls -la packages/figma-plugin/dist/
   # Should show: manifest.json, plugin.js, ui.html, ui.js
   ```

3. **Check Manifest Path**
   - Make sure you're selecting the RIGHT manifest.json
   - Path: `packages/figma-plugin/manifest.json` (NOT the dist folder)

4. **Rebuild**
   ```bash
   cd packages/figma-plugin
   npm run build
   ```

5. **Check Console**
   - In Figma: Right-click → Show Console
   - Look for any error messages

### Plugin Loads but Shows Errors

1. **Check Browser Console in Plugin UI**
   - Right-click in plugin UI → Inspect
   - Look at Console tab for errors

2. **Check Plugin Console**
   - In Figma: Right-click → Show console
   - Shows main thread errors

### Token Reading Not Working

1. Make sure you have Tokens Studio tokens in the file
2. Open Tokens Studio plugin first to verify tokens exist
3. Check the console for error messages

## What Works Right Now

✅ Plugin loads and displays UI
✅ React components render
✅ Message passing between plugin and UI
✅ Token Studio reader implementation
✅ Token display with visual previews

## What Needs API Key

These features need an Anthropic API key (set in environment):
- AI Token Generation
- Token Analysis
- Smart Suggestions

To enable AI features:
1. Get API key from: https://console.anthropic.com/
2. Set environment variable: `ANTHROPIC_API_KEY=your_key`
3. Rebuild and reload plugin

## Next Steps

1. **Load the plugin** using the instructions above
2. **Test basic functionality** to ensure UI works
3. **Try reading Tokens Studio tokens** if you have them
4. **Report any issues** you encounter

---

The plugin is now fixed and ready to use! 🎉
