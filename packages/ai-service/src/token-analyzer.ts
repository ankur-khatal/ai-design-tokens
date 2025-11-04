/**
 * AI Token Analyzer
 *
 * Uses Claude AI to analyze design tokens and provide suggestions
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  TokenCollection,
  AITokenAnalysis,
  AITokenSuggestion,
} from '@ai-tokens/shared';

export class TokenAnalyzer {
  private anthropic: Anthropic;

  constructor(apiKey?: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Analyze tokens and provide improvement suggestions
   */
  async analyze(tokens: TokenCollection): Promise<AITokenAnalysis> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(tokens);

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return this.parseAnalysisResponse(content.text);
    } catch (error) {
      console.error('Error analyzing tokens:', error);
      throw new Error(
        `Failed to analyze tokens: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get specific suggestions for token improvements
   */
  async getSuggestions(tokens: TokenCollection): Promise<AITokenSuggestion[]> {
    const analysis = await this.analyze(tokens);
    const suggestions: AITokenSuggestion[] = [];

    // Convert naming issues to suggestions
    if (analysis.namingIssues) {
      for (const issue of analysis.namingIssues) {
        suggestions.push({
          type: 'naming',
          token: issue.token,
          currentValue: undefined,
          suggestedValue: issue.suggestion,
          reason: issue.issue,
          autoApply: false,
        });
      }
    }

    // Convert duplicates to consolidation suggestions
    if (analysis.duplicates) {
      for (const duplicate of analysis.duplicates) {
        suggestions.push({
          type: 'consolidation',
          token: duplicate.tokens[0],
          currentValue: undefined,
          reason: duplicate.suggestion,
          autoApply: false,
        });
      }
    }

    // Convert accessibility issues to suggestions
    if (analysis.accessibilityIssues) {
      for (const issue of analysis.accessibilityIssues) {
        suggestions.push({
          type: 'accessibility',
          token: issue.token,
          currentValue: undefined,
          reason: issue.issue,
          autoApply: false,
        });
      }
    }

    return suggestions;
  }

  private buildSystemPrompt(): string {
    return `You are an expert design systems auditor specializing in design token analysis.

Your task is to analyze design token collections and identify:
1. Duplicate or near-duplicate tokens that could be consolidated
2. Naming inconsistencies or improvements
3. Accessibility issues (especially color contrast)
4. Optimization opportunities

Guidelines:
- Focus on actionable improvements
- Consider industry best practices
- Prioritize accessibility (WCAG AA minimum)
- Look for semantic naming opportunities
- Identify missing token relationships

Response Format:
Return ONLY a valid JSON object with this structure:
{
  "duplicates": [
    {
      "tokens": ["token1", "token2"],
      "suggestion": "Description of consolidation"
    }
  ],
  "namingIssues": [
    {
      "token": "token-name",
      "issue": "What's wrong",
      "suggestion": "Suggested new name"
    }
  ],
  "accessibilityIssues": [
    {
      "token": "token-name",
      "issue": "Description of issue",
      "wcagLevel": "AA"
    }
  ],
  "optimizations": [
    {
      "description": "Optimization suggestion",
      "impact": "high"
    }
  ]
}`;
  }

  private buildUserPrompt(tokens: TokenCollection): string {
    // Serialize tokens for analysis
    const serialized = JSON.stringify(tokens, null, 2);

    return `Please analyze these design tokens and provide improvement suggestions:

${serialized}

Focus on:
1. Finding duplicate or similar values that could be consolidated
2. Identifying naming inconsistencies
3. Checking color contrast for accessibility
4. Suggesting organizational improvements`;
  }

  private parseAnalysisResponse(text: string): AITokenAnalysis {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        duplicates: parsed.duplicates || [],
        namingIssues: parsed.namingIssues || [],
        accessibilityIssues: parsed.accessibilityIssues || [],
        optimizations: parsed.optimizations || [],
      };
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      throw new Error('Failed to parse token analysis response');
    }
  }
}
