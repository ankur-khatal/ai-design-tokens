/**
 * Build script for Figma plugin using esbuild
 */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');
const isDev = isWatch || process.env.NODE_ENV === 'development';

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy manifest.json to dist
fs.copyFileSync(
  path.join(__dirname, 'manifest.json'),
  path.join(distDir, 'manifest.json')
);

// Common esbuild options
const commonOptions = {
  bundle: true,
  minify: !isDev,
  sourcemap: isDev,
  logLevel: 'info',
};

// Build plugin (main thread)
const pluginConfig = {
  ...commonOptions,
  entryPoints: ['src/plugin/index.ts'],
  outfile: 'dist/plugin.js',
  platform: 'node',
  target: 'es2020',
  external: [],
};

// Build UI
const uiConfig = {
  ...commonOptions,
  entryPoints: ['src/ui/index.tsx'],
  outfile: 'dist/ui.js',
  platform: 'browser',
  target: 'es2020',
};

// Create HTML for UI
const createUIHTML = () => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AI Design Tokens</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      background: #ffffff;
      color: #000000;
    }
    #root {
      width: 100%;
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="ui.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(distDir, 'ui.html'), html);
};

async function build() {
  try {
    // Build plugin
    await esbuild.build(pluginConfig);
    console.log('✓ Plugin built');

    // Build UI
    await esbuild.build(uiConfig);
    console.log('✓ UI built');

    // Create HTML
    createUIHTML();
    console.log('✓ UI HTML created');

    console.log('\n✨ Build complete!\n');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

async function watch() {
  try {
    // Watch plugin
    const pluginContext = await esbuild.context(pluginConfig);
    await pluginContext.watch();
    console.log('👀 Watching plugin...');

    // Watch UI
    const uiContext = await esbuild.context(uiConfig);
    await uiContext.watch();
    console.log('👀 Watching UI...');

    // Create HTML (one-time in watch mode)
    createUIHTML();

    console.log('\n✨ Watch mode enabled!\n');
  } catch (error) {
    console.error('Watch failed:', error);
    process.exit(1);
  }
}

// Run build or watch
if (isWatch) {
  watch();
} else {
  build();
}
