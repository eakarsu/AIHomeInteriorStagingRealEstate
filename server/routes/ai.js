const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../openrouter');
const router = express.Router();

// AI Room Staging Suggestions
router.post('/staging-suggestions', auth, async (req, res) => {
  try {
    const { roomType, roomSize, currentCondition, style, budget, propertyType } = req.body;
    const prompt = `As an expert home stager, provide detailed staging suggestions for a ${roomType} room.

Room Details:
- Size: ${roomSize || 'Standard'} sq ft
- Current Condition: ${currentCondition || 'Average'}
- Desired Style: ${style || 'Modern Transitional'}
- Budget: $${budget || '5000'}
- Property Type: ${propertyType || 'Single Family Home'}

Please provide:
1. Top 5 specific staging recommendations with estimated costs
2. Color palette suggestion (specific colors with hex codes)
3. Key furniture pieces needed with placement tips
4. Lighting recommendations
5. Accessory and finishing touch suggestions
6. Expected impact on buyer perception (score out of 10)
7. Estimated ROI percentage for this staging investment`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Color Palette Generator
router.post('/color-palette', auth, async (req, res) => {
  try {
    const { roomType, style, mood, existingColors, naturalLight } = req.body;
    const prompt = `As a color consultant for home staging, generate a professional color palette.

Requirements:
- Room Type: ${roomType || 'Living Room'}
- Design Style: ${style || 'Contemporary'}
- Desired Mood: ${mood || 'Warm and inviting'}
- Existing Colors to Work With: ${existingColors || 'None specified'}
- Natural Light Level: ${naturalLight || 'Moderate'}

Please provide:
1. Primary wall color (name and hex code)
2. Secondary/accent wall color (name and hex code)
3. Trim color (name and hex code)
4. 3 accent colors for accessories (names and hex codes)
5. Recommended paint brands and specific shade names
6. Color psychology explanation for buyer appeal
7. Tips for applying the palette in the space
8. Complementary materials and textures`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Property Listing Generator
router.post('/listing-generator', auth, async (req, res) => {
  try {
    const { propertyTitle, address, bedrooms, bathrooms, sqft, price, features, style, targetAudience } = req.body;
    const prompt = `As a luxury real estate copywriter, create a compelling property listing.

Property Details:
- Title: ${propertyTitle || 'Beautiful Home'}
- Address: ${address || 'Prime Location'}
- Bedrooms: ${bedrooms || 3}, Bathrooms: ${bathrooms || 2}
- Square Feet: ${sqft || 2000}
- List Price: $${price || '500000'}
- Key Features: ${features || 'Modern kitchen, hardwood floors'}
- Staging Style: ${style || 'Contemporary'}
- Target Audience: ${targetAudience || 'Young professionals and families'}

Please provide:
1. Attention-grabbing headline (under 80 characters)
2. Compelling 200-word property description
3. 8 key selling points as bullet points
4. Emotional hook paragraph for the target audience
5. Call-to-action statement
6. SEO-optimized keywords for this listing
7. Social media caption (under 150 characters)`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Budget Estimator
router.post('/budget-estimator', auth, async (req, res) => {
  try {
    const { propertyType, sqft, rooms, style, market, timeline } = req.body;
    const prompt = `As a home staging business consultant, provide a detailed staging budget estimate.

Property Info:
- Property Type: ${propertyType || 'Single Family Home'}
- Total Square Footage: ${sqft || 2000}
- Number of Rooms to Stage: ${rooms || 5}
- Desired Style: ${style || 'Transitional'}
- Market: ${market || 'Suburban'}
- Timeline: ${timeline || '2 weeks'}

Please provide:
1. Detailed room-by-room budget breakdown
2. Furniture rental costs vs purchase options
3. Accessory and decor budget
4. Professional services costs (cleaning, painting, photography)
5. Total estimated staging cost (low, mid, high ranges)
6. Expected ROI based on market data
7. Cost-saving tips without sacrificing impact
8. Payment timeline and milestones
9. Comparison with virtual staging costs`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Design Style Recommender
router.post('/style-recommender', auth, async (req, res) => {
  try {
    const { propertyType, architecture, neighborhood, targetBuyer, priceRange, existingFeatures } = req.body;
    const prompt = `As an interior design expert specializing in home staging, recommend the ideal design style.

Property Context:
- Property Type: ${propertyType || 'Single Family Home'}
- Architectural Style: ${architecture || 'Modern'}
- Neighborhood Character: ${neighborhood || 'Urban professional'}
- Target Buyer Profile: ${targetBuyer || 'Young professionals'}
- Price Range: ${priceRange || '$500k-$800k'}
- Existing Features: ${existingFeatures || 'Open floor plan, large windows'}

Please provide:
1. Top 3 recommended design styles with reasoning
2. Specific furniture recommendations for each style
3. Color palette for each recommended style
4. Key accessories and decor items
5. What to avoid for this property
6. Market appeal analysis
7. Budget comparison between recommended styles
8. Trend forecast - which style has the most staying power`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Furniture Placement Advisor
router.post('/furniture-placement', auth, async (req, res) => {
  try {
    const { roomType, dimensions, features, style, furnitureList } = req.body;
    const prompt = `As a professional home stager, provide furniture placement advice.

Room Details:
- Room Type: ${roomType || 'Living Room'}
- Dimensions: ${dimensions || '15ft x 20ft'}
- Architectural Features: ${features || 'Large window on south wall, fireplace on east wall'}
- Style: ${style || 'Contemporary'}
- Available Furniture: ${furnitureList || 'Sofa, coffee table, two accent chairs, console table, area rug'}

Please provide:
1. Optimal furniture layout description with specific placement
2. Traffic flow considerations
3. Focal point strategy
4. Furniture grouping suggestions
5. Scale and proportion guidelines
6. What additional pieces would enhance the room
7. Common placement mistakes to avoid
8. How this layout maximizes perceived space`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Before/After Description Generator
router.post('/before-after', auth, async (req, res) => {
  try {
    const { roomName, beforeState, afterStyle, changesApplied, budget } = req.body;
    const prompt = `As a home staging marketing expert, create a compelling before/after transformation narrative.

Transformation Details:
- Room: ${roomName || 'Living Room'}
- Before State: ${beforeState || 'Empty, dated room with worn carpet'}
- After Style: ${afterStyle || 'Modern Farmhouse'}
- Changes Applied: ${changesApplied || 'New paint, furniture staging, accessories, lighting update'}
- Budget Spent: $${budget || '3500'}

Please provide:
1. Dramatic before description (paint the picture of the untouched room)
2. Transformation story (the process and vision)
3. Stunning after description (make it aspirational)
4. Key design decisions and why they work
5. Impact on buyer perception
6. ROI analysis for this specific transformation
7. Social media post for this before/after (Instagram-ready)
8. Lessons learned that apply to similar spaces`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Market Analysis
router.post('/market-analysis', auth, async (req, res) => {
  try {
    const { region, propertyType, priceRange, targetSeason } = req.body;
    const prompt = `As a real estate market analyst specializing in staging ROI, provide market analysis.

Market Context:
- Region: ${region || 'National Average'}
- Property Type: ${propertyType || 'Single Family Home'}
- Price Range: ${priceRange || '$400k-$700k'}
- Target Season: ${targetSeason || 'Spring 2024'}

Please provide:
1. Current staging market trends for this region
2. Average staging costs and ROI data
3. Most effective staging styles for the market
4. Days on market comparison (staged vs unstaged)
5. Price premium analysis for staged properties
6. Seasonal staging recommendations
7. Competitor analysis (what top stagers are doing)
8. Forecast for the next 6 months
9. Investment recommendations for staging businesses`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Checklist Generator
router.post('/checklist-generator', auth, async (req, res) => {
  try {
    const { propertyType, rooms, style, timeline, budget } = req.body;
    const prompt = `As a professional home staging project manager, create a comprehensive staging checklist.

Project Details:
- Property Type: ${propertyType || 'Single Family Home'}
- Rooms to Stage: ${rooms || 'Living room, kitchen, master bedroom, bathroom, dining room'}
- Style: ${style || 'Contemporary'}
- Timeline: ${timeline || '10 days'}
- Budget: $${budget || '8000'}

Please provide a day-by-day staging checklist including:
1. Pre-staging preparation tasks (cleaning, repairs, painting)
2. Furniture delivery and placement schedule
3. Accessory and decor installation tasks
4. Lighting setup tasks
5. Final touches and photography preparation
6. Quality control checklist
7. De-staging plan
8. Assign priority levels (high/medium/low) to each task
9. Estimated time for each task`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Virtual Staging Description
router.post('/virtual-staging', auth, async (req, res) => {
  try {
    const { roomType, currentState, desiredStyle, budget } = req.body;
    const prompt = `As a virtual staging expert, describe how to virtually stage this room.

Room Details:
- Room Type: ${roomType || 'Living Room'}
- Current State: ${currentState || 'Empty room with white walls'}
- Desired Style: ${desiredStyle || 'Modern Luxury'}
- Budget for Virtual Staging: $${budget || '200'}

Please provide:
1. Detailed virtual staging plan with specific furniture and decor items
2. Color and material specifications for each piece
3. Placement and arrangement description
4. Lighting effects to add virtually
5. Background and window treatment suggestions
6. Before/after expectation description
7. Best virtual staging tools recommended
8. Tips for photorealistic results
9. Cost comparison vs physical staging`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Property Analyzer
router.post('/property-analyzer', auth, async (req, res) => {
  try {
    const { propertyType, location, sqft, bedrooms, bathrooms, age, condition, price } = req.body;
    const prompt = `As a real estate staging strategist, analyze this property and provide a comprehensive staging strategy.

Property Details:
- Property Type: ${propertyType || 'Single Family Home'}
- Location: ${location || 'Suburban neighborhood'}
- Square Footage: ${sqft || 2000}
- Bedrooms: ${bedrooms || 3}, Bathrooms: ${bathrooms || 2}
- Property Age: ${age || '10 years'}
- Overall Condition: ${condition || 'Good'}
- Listing Price: $${price || '500000'}

Please provide:
1. Property staging priority assessment (which rooms to stage first and why)
2. Target buyer demographic analysis
3. Competitive market positioning strategy
4. Key selling features to highlight through staging
5. Problem areas that staging should address or minimize
6. Recommended staging investment as percentage of listing price
7. Expected impact on days-on-market and final sale price
8. Photography and showing strategy after staging
9. Open house staging tips specific to this property
10. Risk assessment - what happens if we don't stage`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Room Optimizer
router.post('/room-optimizer', auth, async (req, res) => {
  try {
    const { roomType, width, length, ceilingHeight, issues, purpose } = req.body;
    const prompt = `As a spatial design expert for home staging, optimize this room for maximum buyer appeal.

Room Details:
- Room Type: ${roomType || 'Living Room'}
- Width: ${width || '14'} ft, Length: ${length || '18'} ft
- Ceiling Height: ${ceilingHeight || '9 ft'}
- Current Issues: ${issues || 'Feels small, poor lighting, awkward layout'}
- Intended Purpose: ${purpose || 'Show as versatile living space'}

Please provide:
1. Space optimization strategy (how to make it feel larger/better)
2. Traffic flow and furniture arrangement plan
3. Lighting plan (natural + artificial) to transform the space
4. Mirror and visual trick recommendations
5. Wall treatment suggestions (paint, accent walls, artwork placement)
6. Flooring and rug recommendations
7. Window treatment strategy
8. Storage solutions that add appeal
9. Scent and sensory staging tips
10. Before/after visualization description`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Client Proposal Generator
router.post('/client-proposal', auth, async (req, res) => {
  try {
    const { clientName, clientType, propertyType, propertyAddress, budget, timeline, goals } = req.body;
    const prompt = `As a professional home staging business consultant, create a client proposal.

Client Details:
- Client Name: ${clientName || 'Client'}
- Client Type: ${clientType || 'Real Estate Agent'}
- Property Type: ${propertyType || 'Single Family Home'}
- Property Address: ${propertyAddress || 'Residential area'}
- Budget Range: $${budget || '5000-10000'}
- Timeline: ${timeline || '2 weeks'}
- Goals: ${goals || 'Sell faster and for a higher price'}

Please create a professional staging proposal including:
1. Executive summary (2-3 paragraphs)
2. Scope of work (room-by-room plan)
3. Design concept and style recommendation
4. Detailed pricing breakdown with options (basic, standard, premium)
5. Timeline and milestones
6. Expected ROI and market data to support the investment
7. Terms and conditions summary
8. Testimonial-style selling points
9. Next steps and call-to-action
10. Value proposition - why choose our staging services`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Appointment Planner
router.post('/appointment-planner', auth, async (req, res) => {
  try {
    const { appointmentType, propertyType, propertySize, clientType, duration, goals } = req.body;
    const prompt = `As a home staging consultation expert, plan this appointment for maximum effectiveness.

Appointment Details:
- Type: ${appointmentType || 'Initial Staging Consultation'}
- Property Type: ${propertyType || 'Single Family Home'}
- Property Size: ${propertySize || '2000 sqft'}
- Client Type: ${clientType || 'Real Estate Agent'}
- Duration: ${duration || '90 minutes'}
- Goals: ${goals || 'Assess property and present staging plan'}

Please provide:
1. Pre-appointment preparation checklist
2. Minute-by-minute agenda breakdown
3. Key questions to ask the client
4. Room-by-room assessment guide
5. Photography checklist during walkthrough
6. Measurement and documentation plan
7. Presentation talking points
8. Common client objections and responses
9. Follow-up action items
10. Post-appointment email template`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Invoice & Pricing Calculator
router.post('/pricing-calculator', auth, async (req, res) => {
  try {
    const { serviceType, propertyType, sqft, rooms, market, duration, extras } = req.body;
    const prompt = `As a home staging pricing strategist, calculate optimal pricing for this project.

Project Details:
- Service Type: ${serviceType || 'Full Home Staging'}
- Property Type: ${propertyType || 'Single Family Home'}
- Square Footage: ${sqft || 2000}
- Number of Rooms: ${rooms || 5}
- Market Area: ${market || 'Suburban'}
- Staging Duration: ${duration || '60 days'}
- Additional Services: ${extras || 'Photography, consultation, de-staging'}

Please provide:
1. Recommended pricing structure (flat fee vs monthly rental)
2. Detailed line-item pricing breakdown
3. Competitor pricing comparison for this market
4. Tiered pricing options (good, better, best)
5. Add-on services with pricing
6. Discount strategies for repeat clients
7. Payment terms recommendation
8. Professional invoice template with suggested line items
9. Profit margin analysis
10. Seasonal pricing adjustments`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Furniture Recommender
router.post('/furniture-recommender', auth, async (req, res) => {
  try {
    const { roomType, style, budget, roomSize, existingPieces, colorScheme } = req.body;
    const prompt = `As a furniture buying specialist for home staging, recommend the perfect furniture package.

Requirements:
- Room Type: ${roomType || 'Living Room'}
- Design Style: ${style || 'Contemporary'}
- Budget: $${budget || '3000'}
- Room Size: ${roomSize || '15x20 ft'}
- Existing Pieces to Keep: ${existingPieces || 'None'}
- Color Scheme: ${colorScheme || 'Neutral warm tones'}

Please provide:
1. Complete furniture package list with specific pieces
2. Priority ranking (must-have vs nice-to-have)
3. Specific brand and product recommendations with price ranges
4. Buy vs rent analysis for each piece
5. Alternative budget-friendly options
6. Accessory and decor items to complete the look
7. Arrangement and styling tips for each piece
8. Care and maintenance during staging period
9. Sourcing recommendations (stores, online, wholesale)
10. Investment pieces worth buying vs disposable staging items`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Vendor Matcher
router.post('/vendor-matcher', auth, async (req, res) => {
  try {
    const { serviceNeeded, location, budget, timeline, quality, projectType } = req.body;
    const prompt = `As a home staging operations manager, recommend the ideal vendor strategy for this project.

Project Needs:
- Service Needed: ${serviceNeeded || 'Full staging with furniture rental'}
- Location: ${location || 'Major metro area'}
- Budget for Vendors: $${budget || '5000'}
- Timeline: ${timeline || '2 weeks'}
- Quality Level: ${quality || 'High-end'}
- Project Type: ${projectType || 'Luxury home staging'}

Please provide:
1. Types of vendors needed (categorized list)
2. Vendor selection criteria and red flags
3. Budget allocation per vendor category
4. Negotiation tips for each vendor type
5. Contract essentials to include
6. Coordination timeline between vendors
7. Quality control checkpoints
8. Backup vendor strategy
9. Vendor relationship building tips for repeat business
10. Cost-saving vendor combinations and packages`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI ROI Calculator
router.post('/roi-calculator', auth, async (req, res) => {
  try {
    const { listingPrice, stagingCost, propertyType, market, daysOnMarket, condition } = req.body;
    const prompt = `As a real estate investment analyst, calculate the staging ROI for this property.

Investment Details:
- Listing Price: $${listingPrice || '500000'}
- Staging Investment: $${stagingCost || '8000'}
- Property Type: ${propertyType || 'Single Family Home'}
- Market: ${market || 'Suburban competitive'}
- Current Days on Market: ${daysOnMarket || '0 (new listing)'}
- Property Condition: ${condition || 'Good'}

Please provide:
1. Expected ROI percentage with confidence range
2. Projected sale price increase from staging
3. Estimated reduction in days on market
4. Carrying cost savings analysis (mortgage, taxes, insurance saved)
5. Break-even analysis
6. Comparison with unstaged comparable properties
7. Risk-adjusted ROI calculation
8. Sensitivity analysis (best case, expected, worst case)
9. Cumulative financial impact summary
10. Data-backed recommendation: stage or not?`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Curb Appeal Advisor
router.post('/curb-appeal', auth, async (req, res) => {
  try {
    const { propertyType, exteriorCondition, landscaping, budget, season, issues } = req.body;
    const prompt = `As a curb appeal and exterior staging expert, provide recommendations.

Property Exterior:
- Property Type: ${propertyType || 'Single Family Home'}
- Exterior Condition: ${exteriorCondition || 'Average'}
- Current Landscaping: ${landscaping || 'Basic lawn, few shrubs'}
- Budget: $${budget || '2000'}
- Season: ${season || 'Spring'}
- Known Issues: ${issues || 'Dated front door, faded paint, bare flower beds'}

Please provide:
1. First impression assessment and priority fixes
2. Front door and entry staging (specific recommendations)
3. Landscaping quick wins (plants, mulch, lawn care)
4. Exterior lighting plan
5. Driveway and walkway improvements
6. Porch/patio staging tips
7. Mailbox and house number upgrades
8. Seasonal decor suggestions
9. Budget breakdown for each improvement
10. Before/after curb appeal impact score`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Lighting Design
router.post('/lighting-design', auth, async (req, res) => {
  try {
    const { roomType, roomSize, naturalLight, currentFixtures, style, mood } = req.body;
    const prompt = `As a lighting design specialist for home staging, create a lighting plan.

Room Details:
- Room Type: ${roomType || 'Living Room'}
- Room Size: ${roomSize || '15x20 ft'}
- Natural Light: ${naturalLight || 'Moderate, east-facing windows'}
- Current Fixtures: ${currentFixtures || 'Basic overhead light only'}
- Design Style: ${style || 'Contemporary'}
- Desired Mood: ${mood || 'Warm and inviting'}

Please provide:
1. Layered lighting plan (ambient, task, accent)
2. Specific fixture recommendations with placement
3. Bulb type and color temperature recommendations
4. Natural light maximization strategies
5. Dimmer and smart lighting suggestions
6. Accent lighting for architectural features
7. Budget-friendly lighting upgrades
8. Lighting for photography and showings
9. Common lighting mistakes in staging
10. Room-by-room lighting checklist`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Seasonal Staging
router.post('/seasonal-staging', auth, async (req, res) => {
  try {
    const { season, propertyType, style, region, targetBuyer, holidays } = req.body;
    const prompt = `As a seasonal staging expert, provide seasonal staging recommendations.

Context:
- Season: ${season || 'Spring'}
- Property Type: ${propertyType || 'Single Family Home'}
- Current Style: ${style || 'Contemporary'}
- Region: ${region || 'Northeast US'}
- Target Buyer: ${targetBuyer || 'Families'}
- Upcoming Holidays: ${holidays || 'None specific'}

Please provide:
1. Seasonal color palette and decor themes
2. Seasonal scent and sensory staging (candles, flowers, etc.)
3. Outdoor/patio seasonal staging
4. Window and natural light adjustments for the season
5. Seasonal textile swaps (throws, pillows, curtains)
6. Kitchen and dining seasonal touches
7. Holiday-appropriate staging (tasteful, non-denominational)
8. Seasonal curb appeal adjustments
9. Photography tips for the season
10. What to avoid in seasonal staging`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Decluttering Guide
router.post('/decluttering-guide', auth, async (req, res) => {
  try {
    const { propertyType, rooms, occupancyStatus, clutterLevel, timeline, sensitiveItems } = req.body;
    const prompt = `As a professional decluttering and pre-staging consultant, create a decluttering plan.

Property Details:
- Property Type: ${propertyType || 'Single Family Home'}
- Rooms: ${rooms || 'All rooms'}
- Occupancy: ${occupancyStatus || 'Currently occupied'}
- Clutter Level: ${clutterLevel || 'Moderate - typical lived-in home'}
- Timeline: ${timeline || '1 week'}
- Sensitive Considerations: ${sensitiveItems || 'Family with children and pets'}

Please provide:
1. Room-by-room decluttering priority plan
2. The 50% rule and how to apply it
3. What to remove, what to keep, what to store
4. Personal item neutralization strategy
5. Closet and storage area organization
6. Kitchen counter and bathroom decluttering
7. Garage and utility space cleanup
8. Temporary storage solutions
9. Communication tips for occupied homes
10. Pre-photography final decluttering checklist`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Photo Staging Guide
router.post('/photo-staging', auth, async (req, res) => {
  try {
    const { propertyType, rooms, photographer, platform, style, specialFeatures } = req.body;
    const prompt = `As a real estate photography staging expert, prepare this property for its photo shoot.

Details:
- Property Type: ${propertyType || 'Single Family Home'}
- Rooms to Photograph: ${rooms || 'All staged rooms + exterior'}
- Photographer: ${photographer || 'Professional real estate photographer'}
- Listing Platform: ${platform || 'MLS, Zillow, Realtor.com'}
- Staging Style: ${style || 'Contemporary'}
- Special Features: ${specialFeatures || 'Pool, fireplace, city views'}

Please provide:
1. Pre-shoot preparation checklist (cleaning, arranging, lighting)
2. Room-by-room photo styling tips
3. Camera angle recommendations for each room
4. Lighting setup for indoor photography
5. Exterior and twilight shot preparation
6. Detail shots to capture (fixtures, features, textures)
7. Common photo staging mistakes to avoid
8. Seasonal and time-of-day recommendations
9. Virtual tour and video walkthrough staging tips
10. Post-shoot checklist and image selection guide`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Renovation Advisor
router.post('/renovation-advisor', auth, async (req, res) => {
  try {
    const { propertyType, budget, areas, age, goal, timeline } = req.body;
    const prompt = `As a pre-sale renovation advisor specializing in staging preparation, provide renovation recommendations.

Property Details:
- Property Type: ${propertyType || 'Single Family Home'}
- Renovation Budget: $${budget || '10000'}
- Areas of Concern: ${areas || 'Kitchen, bathrooms, flooring'}
- Property Age: ${age || '20 years'}
- Goal: ${goal || 'Maximize sale price with minimal investment'}
- Timeline: ${timeline || '3 weeks'}

Please provide:
1. High-ROI renovation priorities (ranked by impact per dollar)
2. Kitchen updates that pay off (without full remodel)
3. Bathroom quick-win improvements
4. Flooring recommendations and cost comparison
5. Paint and wall treatment suggestions
6. Hardware and fixture upgrades
7. What NOT to renovate before selling
8. DIY vs professional recommendations
9. Renovation timeline and scheduling
10. Total investment vs expected return analysis`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Home Valuation Impact
router.post('/valuation-impact', auth, async (req, res) => {
  try {
    const { currentValue, propertyType, stagingPlan, market, comparables, condition } = req.body;
    const prompt = `As a real estate valuation expert, analyze how staging will impact this property's value.

Property Details:
- Current Estimated Value: $${currentValue || '500000'}
- Property Type: ${propertyType || 'Single Family Home'}
- Staging Plan: ${stagingPlan || 'Full home staging, 6 rooms'}
- Market Conditions: ${market || 'Balanced market'}
- Comparable Sales: ${comparables || 'Similar homes selling at $480k-$530k'}
- Current Condition: ${condition || 'Good but dated'}

Please provide:
1. Current valuation assessment
2. Post-staging value projection (with confidence range)
3. Comparable sales analysis (staged vs unstaged)
4. Market timing recommendation
5. Price positioning strategy
6. Appraisal impact considerations
7. Buyer perception value-add analysis
8. Multiple offer probability increase
9. Net proceeds comparison (staged vs unstaged)
10. Comprehensive staging impact scorecard`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Neighborhood Staging Strategy
router.post('/neighborhood-strategy', auth, async (req, res) => {
  try {
    const { neighborhood, demographics, priceRange, competition, trends, propertyType } = req.body;
    const prompt = `As a neighborhood market specialist, create a staging strategy tailored to this area.

Neighborhood Context:
- Neighborhood: ${neighborhood || 'Suburban residential area'}
- Demographics: ${demographics || 'Young families and professionals'}
- Price Range: ${priceRange || '$400k-$700k'}
- Competition: ${competition || '15 active listings in area'}
- Market Trends: ${trends || 'Steady growth, 5% YoY appreciation'}
- Property Type: ${propertyType || 'Single Family Home'}

Please provide:
1. Neighborhood buyer profile analysis
2. What buyers in this area prioritize
3. Staging style that resonates with local buyers
4. Competitive differentiation strategy
5. Features to highlight vs downplay
6. Local lifestyle staging (schools, parks, amenities)
7. Pricing strategy alignment with staging
8. Open house strategy for the neighborhood
9. Marketing channels most effective for this area
10. Seasonal timing recommendations for this market`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Staging Project Planner
router.post('/project-planner', auth, async (req, res) => {
  try {
    const { propertyType, rooms, budget, style, teamSize, startDate, showingDate } = req.body;
    const prompt = `As a staging project manager, create a complete project plan.

Project Details:
- Property Type: ${propertyType || 'Single Family Home'}
- Rooms to Stage: ${rooms || '6 rooms'}
- Total Budget: $${budget || '10000'}
- Design Style: ${style || 'Transitional'}
- Team Size: ${teamSize || '3 people'}
- Start Date: ${startDate || 'Next Monday'}
- First Showing: ${showingDate || '2 weeks from start'}

Please provide:
1. Complete project timeline (Gantt-chart style breakdown)
2. Team role assignments and responsibilities
3. Budget allocation per phase and room
4. Vendor coordination schedule
5. Furniture and decor procurement plan
6. Day-by-day installation schedule
7. Quality assurance checkpoints
8. Contingency plan for delays
9. Client communication milestones
10. Post-staging maintenance plan`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Open House Optimizer
router.post('/open-house-optimizer', auth, async (req, res) => {
  try {
    const { propertyType, style, expectedVisitors, duration, season, targetBuyer } = req.body;
    const prompt = `As an open house staging and experience expert, optimize this open house event.

Event Details:
- Property Type: ${propertyType || 'Single Family Home'}
- Staging Style: ${style || 'Contemporary'}
- Expected Visitors: ${expectedVisitors || '30-50 people'}
- Duration: ${duration || '2 hours (Sunday 1-3 PM)'}
- Season: ${season || 'Spring'}
- Target Buyer: ${targetBuyer || 'Families and young professionals'}

Please provide:
1. Pre-open house staging refresh checklist
2. Sensory experience plan (scent, music, temperature, lighting)
3. Traffic flow and room showcase order
4. Feature highlight stations and talking points
5. Refreshment and hospitality staging
6. Information materials and presentation
7. Outdoor and curb appeal for arrival experience
8. Common open house staging mistakes
9. Post-open house follow-up strategy
10. Virtual open house hybrid staging tips`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Social Media Content
router.post('/social-media', auth, async (req, res) => {
  try {
    const { platform, contentType, propertyType, style, targetAudience, brandVoice } = req.body;
    const prompt = `As a social media marketing expert for home staging businesses, create content.

Content Brief:
- Platform: ${platform || 'Instagram'}
- Content Type: ${contentType || 'Before/After Showcase'}
- Property Type: ${propertyType || 'Single Family Home'}
- Staging Style: ${style || 'Contemporary'}
- Target Audience: ${targetAudience || 'Real estate agents and homeowners'}
- Brand Voice: ${brandVoice || 'Professional yet approachable'}

Please provide:
1. Post caption (optimized for the platform)
2. Hashtag strategy (30 relevant hashtags, categorized)
3. Story/Reel script (15-30 seconds)
4. Carousel post slide-by-slide content plan
5. Engagement hooks and call-to-actions
6. Best posting time and frequency
7. Cross-platform adaptation tips
8. Content series ideas (7-day content calendar)
9. User engagement response templates
10. Analytics KPIs to track`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Staging Trend Forecaster
router.post('/trend-forecaster', auth, async (req, res) => {
  try {
    const { region, propertyType, timeHorizon, currentTrends } = req.body;
    const prompt = `As a home staging trend analyst, forecast upcoming design and staging trends.

Context:
- Region: ${region || 'National (US)'}
- Property Type Focus: ${propertyType || 'All residential'}
- Time Horizon: ${timeHorizon || 'Next 12 months'}
- Current Trends You're Seeing: ${currentTrends || 'Warm minimalism, biophilic design, curved furniture'}

Please provide:
1. Top 10 emerging staging trends with confidence ratings
2. Color trends forecast (what's coming, what's going out)
3. Furniture and material trend predictions
4. Buyer preference shifts to watch
5. Technology trends in staging (virtual staging, AI, etc.)
6. Sustainability and eco-staging trends
7. Regional trend variations
8. Luxury vs mainstream staging trend differences
9. Trends to adopt NOW vs wait on
10. How to future-proof your staging inventory`;

    const result = await callOpenRouter(prompt);
    res.json({ success: !result.error, data: result.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
