const https = require('https');

async function callOpenRouter(prompt, systemPrompt = 'You are an expert AI home interior staging consultant for real estate.') {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';
  const baseUrl = new URL(process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1');

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return { error: true, content: 'OpenRouter API key is not configured.' };
  }

  const data = JSON.stringify({
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    max_tokens: 2000,
    temperature: 0.7,
  });

  return new Promise((resolve) => {
    const options = {
      hostname: baseUrl.hostname,
      port: baseUrl.port || 443,
      path: `${baseUrl.pathname.replace(/\/$/, '')}/chat/completions`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'AI Home Interior Staging',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode < 200 || res.statusCode >= 300) {
            resolve({ error: true, content: parsed.error?.message || `OpenRouter HTTP ${res.statusCode}` });
            return;
          }
          if (parsed.choices && parsed.choices[0]) {
            resolve({
              error: false,
              content: parsed.choices[0].message.content,
              model: parsed.model,
              usage: parsed.usage,
            });
          } else {
            resolve({ error: true, content: parsed.error?.message || 'Unknown error from OpenRouter' });
          }
        } catch (e) {
          resolve({ error: true, content: 'Failed to parse OpenRouter response' });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ error: true, content: `OpenRouter request failed: ${err.message}` });
    });

    req.setTimeout(30000, () => {
      req.destroy();
      resolve({ error: true, content: 'OpenRouter request timed out' });
    });

    req.write(data);
    req.end();
  });
}

function generateFallbackResponse(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes('staging suggestion') || lower.includes('stage')) {
    return `## Staging Recommendations

### Key Improvements
1. **Declutter and Depersonalize** - Remove personal items to let buyers envision themselves in the space
2. **Neutral Color Palette** - Apply warm neutral tones (Agreeable Gray SW 7029 or similar) to walls
3. **Strategic Furniture Placement** - Arrange furniture to create conversation areas and highlight architectural features
4. **Lighting Layers** - Add ambient, task, and accent lighting to create warmth and dimension
5. **Fresh Elements** - Include fresh flowers, potted plants, and seasonal touches

### Budget Estimate
- Basic staging: $2,000 - $4,000
- Mid-range staging: $4,000 - $8,000
- Luxury staging: $8,000 - $15,000+

### Expected ROI
Staged homes typically sell 73% faster and for 6-10% more than unstaged comparable properties.

*Note: Connect your OpenRouter API key for personalized AI-powered recommendations.*`;
  }
  if (lower.includes('color') || lower.includes('palette')) {
    return `## Recommended Color Palette

### Primary Palette
- **Walls**: Warm White (#F5F5F0) - Creates a bright, welcoming base
- **Trim**: Pure White (#FFFFFF) - Clean, crisp contrast
- **Accent Wall**: Sage Green (#9CAF88) - Brings nature indoors

### Complementary Colors
- **Soft Gold** (#D4AF37) - For accessories and hardware
- **Charcoal** (#36454F) - For grounding elements
- **Blush** (#F4C2C2) - For textiles and soft furnishings

### Application Tips
1. Use the 60-30-10 rule: 60% dominant color, 30% secondary, 10% accent
2. Test colors in both natural and artificial light
3. Consider the room's orientation for warm vs. cool tones

*Note: Connect your OpenRouter API key for personalized AI-powered color recommendations.*`;
  }
  if (lower.includes('listing') || lower.includes('description')) {
    return `## Property Listing Description

**Headline**: Where Modern Elegance Meets Effortless Living

Step into a home that redefines sophisticated living. This meticulously staged property showcases thoughtful design at every turn, from the sun-drenched living spaces to the chef-inspired kitchen that beckons weekend entertaining.

**Key Highlights**:
- Professionally staged to showcase each room's full potential
- Natural light floods through oversized windows
- Premium finishes and thoughtful architectural details throughout
- Seamless indoor-outdoor living for year-round enjoyment

**The Experience**: From the moment you arrive, you'll appreciate the curb appeal and welcoming entry. Inside, a curated collection of furnishings creates warm, inviting spaces that feel both luxurious and livable.

*Schedule your private showing today — this won't last long.*

*Note: Connect your OpenRouter API key for personalized AI-powered listing descriptions.*`;
  }
  if (lower.includes('budget') || lower.includes('cost') || lower.includes('estimate')) {
    return `## Staging Budget Estimate

### Room-by-Room Breakdown
| Room | Basic | Standard | Premium |
|------|-------|----------|---------|
| Living Room | $1,500 | $3,000 | $6,000 |
| Master Bedroom | $800 | $1,800 | $3,500 |
| Kitchen | $400 | $1,000 | $2,000 |
| Dining Room | $600 | $1,500 | $3,000 |
| Bathroom | $200 | $500 | $1,000 |
| Outdoor/Patio | $500 | $1,200 | $2,500 |

### Additional Costs
- **Consultation**: $150 - $500
- **Photography**: $300 - $1,000
- **Monthly Rental**: 50-70% of initial staging cost
- **De-staging**: $500 - $1,500

### ROI Analysis
- Average staging investment: $5,000 - $10,000
- Average sale price increase: 6-10%
- Average reduction in days on market: 30-50%

*Note: Connect your OpenRouter API key for personalized AI-powered budget estimates.*`;
  }
  return `## AI Analysis

Based on your request, here are key recommendations for your home staging project:

### Assessment
1. **Market Positioning** - Understanding your target buyer demographic is crucial for effective staging
2. **Style Selection** - Choose a design style that appeals to the broadest buyer pool in your market
3. **Investment Priority** - Focus staging budget on high-impact rooms: living room, kitchen, and master bedroom

### Best Practices
- Stage the top 3 rooms minimum for maximum ROI
- Use professional photography after staging
- Consider virtual staging for vacant properties
- Update hardware, fixtures, and paint for quick wins
- Remove all personal items and excess furniture

### Industry Stats
- 82% of buyers' agents say staging makes it easier for buyers to visualize the property
- Staged homes sell for 5-23% more than unstaged homes
- 31% of sellers' agents say staging increased the dollar value offered

*Note: Connect your OpenRouter API key for personalized AI-powered recommendations.*`;
}

module.exports = { callOpenRouter };
