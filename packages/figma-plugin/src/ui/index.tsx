/**
 * Plugin UI (runs in iframe)
 *
 * React-based UI for the plugin
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  PluginMessage,
  TokenCollection,
  ReadTokensStudioResponse,
} from '@ai-tokens/shared';
import './styles.css';

// Main App Component
function App() {
  const [tokens, setTokens] = useState<TokenCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokensSource, setTokensSource] = useState<'tokens-studio' | 'ai-tokens' | 'none'>('none');
  const [stats, setStats] = useState<any>(null);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    // Listen for messages from plugin
    window.onmessage = (event: MessageEvent<PluginMessage>) => {
      const msg = event.data.pluginMessage;
      console.log('UI received message:', msg.type);

      switch (msg.type) {
        case 'INIT':
          handleInit(msg.payload);
          break;

        case 'READ_TOKENS_STUDIO':
          handleReadTokensStudioResponse(msg.payload);
          break;

        case 'ERROR':
          setError(msg.payload.message);
          setLoading(false);
          break;
      }
    };

    // Initialize
    sendMessage({ type: 'INIT' });
  }, []);

  const handleInit = (payload: any) => {
    console.log('Initialization payload:', payload);

    if (payload.tokensStudio?.found) {
      setTokens(payload.tokensStudio.tokens);
      setTokensSource('tokens-studio');
    } else if (payload.ourTokens) {
      setTokens(payload.ourTokens);
      setTokensSource('ai-tokens');
    }

    setStats(payload.stats);
    setLoading(false);
  };

  const handleReadTokensStudioResponse = (payload: ReadTokensStudioResponse['payload']) => {
    if (payload.success && payload.tokens) {
      setTokens(payload.tokens);
      setTokensSource('tokens-studio');
      setError(null);
    } else {
      setError(payload.error || 'No tokens found');
    }
    setLoading(false);
  };

  const sendMessage = (msg: PluginMessage) => {
    parent.postMessage({ pluginMessage: msg }, '*');
  };

  const handleReadTokensStudio = () => {
    setLoading(true);
    setError(null);
    sendMessage({ type: 'READ_TOKENS_STUDIO' });
  };

  const handleAIGenerate = () => {
    if (!aiPrompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    sendMessage({
      type: 'AI_GENERATE',
      payload: {
        prompt: aiPrompt,
        context: {
          existingTokens: tokens || undefined,
        },
      },
    });
  };

  const renderTokenSets = () => {
    if (!tokens?.values) return null;

    return Object.entries(tokens.values).map(([setName, tokenSet]) => (
      <div key={setName} className="token-set">
        <h3>{setName}</h3>
        <div className="tokens">
          {renderTokens(tokenSet)}
        </div>
      </div>
    ));
  };

  const renderTokens = (tokenSet: any, prefix = ''): React.ReactNode => {
    return Object.entries(tokenSet).map(([key, value]: [string, any]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      // Check if it's a token or a nested set
      if (value && typeof value === 'object' && 'value' in value && 'type' in value) {
        // It's a token
        return (
          <div key={fullKey} className="token-item">
            <div className="token-name">{key}</div>
            <div className="token-value">
              {renderTokenValue(value)}
            </div>
            <div className="token-type">{value.type}</div>
          </div>
        );
      } else if (value && typeof value === 'object') {
        // It's a nested set
        return (
          <details key={fullKey} className="token-group" open>
            <summary>{key}</summary>
            <div className="token-group-content">
              {renderTokens(value, fullKey)}
            </div>
          </details>
        );
      }

      return null;
    });
  };

  const renderTokenValue = (token: any) => {
    const value = token.value;

    // Color preview
    if (token.type === 'color' && typeof value === 'string') {
      return (
        <div className="color-token">
          <div
            className="color-preview"
            style={{ backgroundColor: value }}
          />
          <span>{value}</span>
        </div>
      );
    }

    // Default rendering
    return <span>{JSON.stringify(value)}</span>;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>🎨 AI Design Tokens</h1>
        <p className="subtitle">
          {tokensSource === 'tokens-studio' && '✅ Tokens Studio Compatible'}
          {tokensSource === 'ai-tokens' && '🤖 AI-Enhanced Tokens'}
          {tokensSource === 'none' && '👋 Get Started'}
        </p>
      </header>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {stats && (
        <div className="stats">
          <div className="stat">
            <div className="stat-value">{stats.nodesWithTokens}</div>
            <div className="stat-label">Nodes with tokens</div>
          </div>
          <div className="stat">
            <div className="stat-value">{stats.uniqueTokensUsed.size}</div>
            <div className="stat-label">Unique tokens used</div>
          </div>
        </div>
      )}

      <div className="section">
        <h2>Import Tokens</h2>
        <button
          className="button button-primary"
          onClick={handleReadTokensStudio}
        >
          📖 Read Tokens Studio Tokens
        </button>
        <p className="hint">
          Import existing Tokens Studio tokens from this Figma file
        </p>
      </div>

      <div className="section">
        <h2>AI Token Generation</h2>
        <textarea
          className="textarea"
          placeholder="Describe the tokens you want to create...&#10;&#10;Examples:&#10;• Create a primary color palette with 5 shades&#10;• Generate spacing tokens following 8px grid&#10;• Make a blue button with hover state"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          rows={4}
        />
        <button
          className="button button-primary"
          onClick={handleAIGenerate}
        >
          🤖 Generate with AI
        </button>
      </div>

      {tokens && (
        <div className="section">
          <h2>Token Sets</h2>
          <div className="token-sets">
            {renderTokenSets()}
          </div>
        </div>
      )}

      {!tokens && !error && tokensSource === 'none' && (
        <div className="empty-state">
          <div className="empty-icon">🎨</div>
          <h3>No tokens found</h3>
          <p>
            Import existing Tokens Studio tokens or generate new ones with AI
          </p>
        </div>
      )}
    </div>
  );
}

// Mount the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
