/**
 * AI Token Generator
 *
 * Uses Claude AI to generate design tokens based on natural language descriptions
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  AITokenGenerationRequest,
  AITokenGenerationResponse,
  TokenSet,
  TokenCollection,
} from '@ai-tokens/shared';

export class TokenGenerator {
  private anthropic: Anthropic;

  constructor(apiKey?: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Generate tokens from a natural language prompt
   */
  async generate(request: AITokenGenerationRequest): Promise<AITokenGenerationResponse> {
    const systemPrompt = this.buildSystemPrompt(request);
    const userPrompt = this.buildUserPrompt(request);

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

      // Extract the response
      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse the JSON response
      const response = this.parseTokenResponse(content.text);

      return response;
    } catch (error) {
      console.error('Error generating tokens:', error);
      throw new Error(
        `Failed to generate tokens: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private buildSystemPrompt(request: AITokenGenerationRequest): string {
    const format = request.options?.format || 'tokens-studio';

    return `You are an expert design systems engineer specializing in design tokens.

Your task is to generate design tokens based on user descriptions. Design tokens are the visual design atoms of a design system — specifically, they are named entities that store visual design attributes.

Format: Generate tokens in ${format} format.

Token Types:
- color: Color values (hex, rgb, hsl)
- spacing: Spacing/sizing values (px, rem)
- fontSize: Font size values
- fontFamily: Font family names
- fontWeight: Font weight values (100-900 or keywords)
- lineHeight: Line height values
- letterSpacing: Letter spacing values
- borderRadius: Border radius values
- borderWidth: Border width values
- opacity: Opacity values (0-1)
- boxShadow: Shadow definitions
- typography: Complete typography definitions

Best Practices:
1. Use semantic naming (e.g., "primary" not "blue")
2. Create token scales (e.g., spacing-xs, spacing-sm, spacing-md, spacing-lg, spacing-xl)
3. Follow 8px grid for spacing when applicable
4. Use token references when appropriate (e.g., {colors.primary})
5. Ensure accessibility (WCAG AA minimum for colors)
6. Create meaningful descriptions

Response Format:
Return ONLY a valid JSON object with this structure:
{
  "tokens": { ... token definitions ... },
  "explanation": "Brief explanation of the tokens created",
  "suggestions": ["Optional suggestions for usage"]
}

Example response for "Create a primary blue color palette":
{
  "tokens": {
    "colors": {
      "primary": {
        "50": { "value": "#e3f2fd", "type": "color", "description": "Lightest primary blue" },
        "100": { "value": "#bbdefb", "type": "color" },
        "200": { "value": "#90caf9", "type": "color" },
        "300": { "value": "#64b5f6", "type": "color" },
        "400": { "value": "#42a5f5", "type": "color" },
        "500": { "value": "#2196f3", "type": "color", "description": "Main primary color" },
        "600": { "value": "#1e88e5", "type": "color" },
        "700": { "value": "#1976d2", "type": "color" },
        "800": { "value": "#1565c0", "type": "color" },
        "900": { "value": "#0d47a1", "type": "color", "description": "Darkest primary blue" }
      }
    }
  },
  "explanation": "Created a Material Design inspired primary blue color palette with 10 shades from light (50) to dark (900)",
  "suggestions": [
    "Use 500 as the main brand color",
    "Use 50-200 for backgrounds",
    "Use 700-900 for text on light backgrounds"
  ]
}`;
  }

  private buildUserPrompt(request: AITokenGenerationRequest): string {
    let prompt = `Generate design tokens for: ${request.prompt}`;

    if (request.context?.existingTokens) {
      const tokenSets = Object.keys(request.context.existingTokens.values);
      prompt += `\n\nExisting token sets in the design system: ${tokenSets.join(', ')}`;
      prompt += `\nPlease ensure the new tokens are compatible and follow the same naming conventions.`;
    }

    if (request.context?.brand) {
      if (request.context.brand.colors) {
        prompt += `\n\nBrand colors: ${request.context.brand.colors.join(', ')}`;
      }
      if (request.context.brand.fonts) {
        prompt += `\nBrand fonts: ${request.context.brand.fonts.join(', ')}`;
      }
    }

    if (request.options?.tokenType) {
      prompt += `\n\nFocus specifically on ${request.options.tokenType} tokens.`;
    }

    if (request.options?.count) {
      prompt += `\nGenerate approximately ${request.options.count} tokens.`;
    }

    return prompt;
  }

  private parseTokenResponse(text: string): AITokenGenerationResponse {
    try {
      // Try to find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        tokens: parsed.tokens || {},
        explanation: parsed.explanation || 'Tokens generated successfully',
        suggestions: parsed.suggestions || [],
      };
    } catch (error) {
      console.error('Error parsing token response:', error);
      console.error('Response text:', text);
      throw new Error('Failed to parse token generation response');
    }
  }
}
