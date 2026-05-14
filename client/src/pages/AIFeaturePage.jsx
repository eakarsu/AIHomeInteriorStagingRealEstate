import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import aiFormConfigs from './aiFormConfigs';

// Which DB dropdowns each feature should show
const featureDropdowns = {
  'staging-suggestions': ['property', 'room', 'designStyle'],
  'color-palette': ['room', 'designStyle', 'colorPalette'],
  'listing-generator': ['property', 'client'],
  'budget-estimator': ['property', 'stagingProject'],
  'style-recommender': ['property', 'designStyle'],
  'furniture-placement': ['room', 'furniture'],
  'before-after': ['property', 'room', 'beforeAfter'],
  'market-analysis': ['marketAnalytics'],
  'checklist-generator': ['property', 'stagingProject'],
  'virtual-staging': ['room', 'designStyle'],
  'property-analyzer': ['property'],
  'room-optimizer': ['room'],
  'client-proposal': ['client', 'property'],
  'appointment-planner': ['appointment', 'client', 'property'],
  'pricing-calculator': ['property', 'stagingProject'],
  'furniture-recommender': ['room', 'furniture', 'designStyle'],
  'vendor-matcher': ['vendor', 'stagingProject'],
  'roi-calculator': ['property', 'stagingProject', 'marketAnalytics'],
  'curb-appeal': ['property'],
  'lighting-design': ['room', 'designStyle'],
  'seasonal-staging': ['property', 'designStyle'],
  'decluttering-guide': ['property', 'room'],
  'photo-staging': ['property', 'room', 'stagingProject'],
  'renovation-advisor': ['property', 'room'],
  'valuation-impact': ['property', 'marketAnalytics'],
  'neighborhood-strategy': ['property', 'marketAnalytics'],
  'project-planner': ['property', 'stagingProject', 'client'],
  'open-house-optimizer': ['property', 'appointment'],
  'social-media': ['property', 'beforeAfter'],
  'trend-forecaster': ['marketAnalytics', 'designStyle'],
};

const dropdownEndpoints = {
  property: { url: '/properties', label: 'Load from Property', display: (p) => `${p.title} - ${p.city}, ${p.state} ($${Number(p.price).toLocaleString()})` },
  room: { url: '/rooms', label: 'Load from Room', display: (r) => `${r.name} (${r.room_type}) - ${r.width}x${r.length} ft` },
  client: { url: '/clients', label: 'Load from Client', display: (c) => `${c.name} - ${c.company} (${c.client_type})` },
  furniture: { url: '/furniture', label: 'Load from Furniture', display: (f) => `${f.name} - ${f.category} (${f.style})` },
  stagingProject: { url: '/staging-projects', label: 'Load from Staging Project', display: (s) => `${s.title} - ${s.style} ($${Number(s.budget).toLocaleString()})` },
  appointment: { url: '/appointments', label: 'Load from Appointment', display: (a) => `${a.title} - ${a.status}` },
  designStyle: { url: '/design-styles', label: 'Load from Design Style', display: (d) => `${d.name} - ${d.best_for}` },
  colorPalette: { url: '/color-palettes', label: 'Load from Color Palette', display: (c) => `${c.name} - ${c.style} (${c.room_type})` },
  beforeAfter: { url: '/before-after', label: 'Load from Before/After', display: (b) => `${b.room_name} - ${b.staging_style} (Impact: ${b.impact_score})` },
  marketAnalytics: { url: '/market-analytics', label: 'Load from Market Data', display: (m) => `${m.region} - ${m.property_type} (ROI: ${m.avg_roi_percentage}%)` },
  vendor: { url: '/vendors', label: 'Load from Vendor', display: (v) => `${v.name} - ${v.category} (${v.rating} stars)` },
};

// Map DB record fields into form fields for each feature+dropdown combo
function mapDbToForm(feature, dropdownType, record) {
  const m = {};
  if (dropdownType === 'property') {
    m.propertyType = record.property_type || '';
    m.propertyTitle = record.title || '';
    m.address = `${record.address}, ${record.city}, ${record.state} ${record.zip}`;
    m.propertyAddress = m.address;
    m.location = `${record.city}, ${record.state}`;
    m.neighborhood = `${record.city}, ${record.state}`;
    m.bedrooms = record.bedrooms?.toString() || '';
    m.bathrooms = record.bathrooms?.toString() || '';
    m.sqft = record.sqft?.toString() || '';
    m.price = record.price?.toString() || '';
    m.listingPrice = record.price?.toString() || '';
    m.currentValue = record.price?.toString() || '';
    m.features = record.description || '';
    m.condition = record.status === 'staging' ? 'Good' : 'Good';
  }
  if (dropdownType === 'room') {
    m.roomType = (record.room_type || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    m.roomSize = record.width && record.length ? Math.round(record.width * record.length).toString() : '';
    m.width = record.width?.toString() || '';
    m.length = record.length?.toString() || '';
    m.dimensions = record.width && record.length ? `${record.width}ft x ${record.length}ft` : '';
    m.currentCondition = (record.current_condition || '').replace(/\b\w/g, c => c.toUpperCase());
    m.roomName = record.name || '';
    m.issues = record.notes || '';
    m.currentState = record.notes || '';
    m.rooms = record.name || '';
  }
  if (dropdownType === 'client') {
    m.clientName = record.name || '';
    m.clientType = record.client_type || '';
    m.targetAudience = record.client_type || '';
    m.targetBuyer = record.client_type === 'Investor' ? 'Investors' : 'Young professionals';
  }
  if (dropdownType === 'furniture') {
    m.furnitureList = record.name + (record.dimensions ? ` (${record.dimensions})` : '');
    m.style = record.style || '';
    m.colorScheme = record.color || '';
    m.existingPieces = record.name || '';
  }
  if (dropdownType === 'stagingProject') {
    m.style = record.style || '';
    m.budget = record.budget?.toString() || '';
    m.stagingCost = record.budget?.toString() || '';
    m.timeline = record.start_date && record.end_date ? '2 weeks' : '2 weeks';
    m.stagingPlan = `${record.title} - ${record.style} style staging`;
    m.rooms = '5';
  }
  if (dropdownType === 'appointment') {
    m.appointmentType = record.title || '';
    m.duration = record.duration_minutes ? `${record.duration_minutes} minutes` : '60 minutes';
    m.goals = record.notes || '';
    m.propertySize = '2000 sqft';
  }
  if (dropdownType === 'designStyle') {
    m.style = record.name || '';
    m.desiredStyle = record.name || '';
    m.afterStyle = record.name || '';
    m.architecture = record.name || '';
    m.existingFeatures = record.key_elements || '';
    m.currentTrends = record.key_elements || '';
  }
  if (dropdownType === 'colorPalette') {
    m.existingColors = `Primary: ${record.primary_color}, Secondary: ${record.secondary_color}, Accent: ${record.accent_color}`;
    m.colorScheme = record.description || '';
    m.mood = record.description || '';
    m.roomType = (record.room_type || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    m.style = record.style || '';
  }
  if (dropdownType === 'beforeAfter') {
    m.roomName = record.room_name || '';
    m.beforeState = record.before_description || '';
    m.afterStyle = record.staging_style || '';
    m.changesApplied = record.after_description || '';
    m.budget = record.cost?.toString() || '';
    m.style = record.staging_style || '';
    m.contentType = 'Before/After Showcase';
  }
  if (dropdownType === 'marketAnalytics') {
    m.region = record.region || '';
    m.market = record.property_type || '';
    m.propertyType = record.property_type || '';
    m.priceRange = '$500k-$800k';
    m.listingPrice = (record.avg_staging_cost * 50)?.toString() || '500000';
    m.competition = `Average ${record.avg_days_on_market} days on market in region`;
    m.trends = `${record.avg_roi_percentage}% average ROI, ${record.staged_vs_unstaged_price_diff}% price difference staged vs unstaged`;
  }
  if (dropdownType === 'vendor') {
    m.serviceNeeded = record.category || '';
    m.location = record.service_area || '';
    m.quality = record.price_range === '$$$$' ? 'Ultra-luxury' : record.price_range === '$$$' ? 'High-end' : 'Mid-range';
    m.projectType = 'Residential staging';
  }
  return m;
}

// Sample presets for every AI feature
const samplePresets = {
  'staging-suggestions': [
    { label: 'Luxury Living Room', data: { roomType: 'Living Room', roomSize: '450', currentCondition: 'Good', style: 'Luxury', budget: '12000', propertyType: 'Penthouse' } },
    { label: 'Cozy Bedroom', data: { roomType: 'Bedroom', roomSize: '250', currentCondition: 'Fair', style: 'Scandinavian', budget: '3000', propertyType: 'Condo' } },
    { label: 'Farmhouse Kitchen', data: { roomType: 'Kitchen', roomSize: '200', currentCondition: 'Good', style: 'Farmhouse', budget: '4500', propertyType: 'Single Family' } },
  ],
  'color-palette': [
    { label: 'Coastal Master Bedroom', data: { roomType: 'Bedroom', style: 'Coastal', mood: 'Cool and serene', existingColors: 'White trim, light oak floors', naturalLight: 'Abundant' } },
    { label: 'Moody Dining Room', data: { roomType: 'Dining Room', style: 'Contemporary', mood: 'Bold and dramatic', existingColors: 'Dark hardwood floors, white ceiling', naturalLight: 'Limited' } },
    { label: 'Zen Bathroom Retreat', data: { roomType: 'Bathroom', style: 'Japanese Zen', mood: 'Cool and serene', existingColors: 'White tile, wood vanity', naturalLight: 'Moderate' } },
  ],
  'listing-generator': [
    { label: 'Downtown SF Loft', data: { propertyTitle: 'Modern Downtown Loft', address: '123 Main St, San Francisco, CA', bedrooms: '2', bathrooms: '2', sqft: '1800', price: '1250000', features: 'Floor-to-ceiling windows, city views, open concept, quartz countertops', style: 'Contemporary', targetAudience: 'Young tech professionals' } },
    { label: 'Beach House', data: { propertyTitle: 'Coastal Beach House', address: '789 Ocean Blvd, Santa Monica, CA', bedrooms: '3', bathrooms: '2.5', sqft: '2200', price: '2100000', features: 'Panoramic ocean views, steps from beach, outdoor living, updated kitchen', style: 'Coastal', targetAudience: 'Luxury buyers and beach lovers' } },
    { label: 'Family Suburban Home', data: { propertyTitle: 'Suburban Family Estate', address: '222 Maple Dr, Austin, TX', bedrooms: '5', bathrooms: '4', sqft: '3800', price: '650000', features: 'Pool, large backyard, great schools, spacious rooms, modern kitchen', style: 'Transitional', targetAudience: 'Growing families relocating to Austin' } },
  ],
  'budget-estimator': [
    { label: 'Small Condo', data: { propertyType: 'Condo', sqft: '900', rooms: '3', style: 'Minimalist', market: 'Urban Standard', timeline: '1 week' } },
    { label: 'Mid-Range Home', data: { propertyType: 'Single Family', sqft: '2200', rooms: '5', style: 'Transitional', market: 'Suburban', timeline: '2 weeks' } },
    { label: 'Luxury Estate', data: { propertyType: 'Luxury Estate', sqft: '4500', rooms: '8', style: 'Luxury', market: 'Urban Luxury', timeline: '3 weeks' } },
  ],
  'style-recommender': [
    { label: 'Victorian Portland Home', data: { propertyType: 'Single Family', architecture: 'Victorian', neighborhood: 'Historic district', targetBuyer: 'Growing families', priceRange: '$800k-$1.2M', existingFeatures: 'Original hardwood floors, crown molding, high ceilings, large windows' } },
    { label: 'Brooklyn Industrial Loft', data: { propertyType: 'Loft', architecture: 'Industrial', neighborhood: 'Trendy/hip', targetBuyer: 'Young professionals', priceRange: '$1.2M-$2M', existingFeatures: 'Exposed brick, 16ft ceilings, open floor plan, large warehouse windows' } },
    { label: 'Palm Springs Mid-Century', data: { propertyType: 'Single Family', architecture: 'Mid-Century', neighborhood: 'Luxury enclave', targetBuyer: 'Luxury buyers', priceRange: '$800k-$1.2M', existingFeatures: 'Floor-to-ceiling glass, flat roof, desert views, pool, post-and-beam' } },
  ],
  'furniture-placement': [
    { label: 'Open Concept Living', data: { roomType: 'Living Room', dimensions: '22ft x 25ft', features: 'Floor-to-ceiling windows south wall, fireplace east wall, open to kitchen north side', style: 'Contemporary', furnitureList: 'L-shaped sectional, coffee table, two accent chairs, console table, floor lamp, area rug 8x10' } },
    { label: 'Compact Bedroom', data: { roomType: 'Bedroom', dimensions: '12ft x 14ft', features: 'Window on west wall, closet doors on north wall, entry door east wall', style: 'Scandinavian', furnitureList: 'Queen bed, two nightstands, dresser, small accent chair, table lamp' } },
    { label: 'Formal Dining Room', data: { roomType: 'Dining Room', dimensions: '14ft x 16ft', features: 'Chandelier centered, bay window south wall, wainscoting, archway to kitchen', style: 'Traditional', furnitureList: 'Dining table seats 8, 8 chairs, sideboard, area rug, table centerpiece' } },
  ],
  'before-after': [
    { label: 'Empty to Luxury', data: { roomName: 'Penthouse Great Room', beforeState: 'Massive empty room, cold concrete floors, bare white walls, echo-filled space feeling uninviting', afterStyle: 'Luxury', changesApplied: 'Italian leather sectional, curated art collection, designer lighting, silk drapes, marble coffee table, plush area rugs', budget: '15000' } },
    { label: 'Dated to Modern', data: { roomName: 'Kitchen & Dining', beforeState: 'Outdated 1990s oak cabinets, cluttered counters, fluorescent lighting, old appliances visible', afterStyle: 'Modern', changesApplied: 'Cabinet refacing, new hardware, decluttered counters, pendant lighting, fresh herbs, modern accessories, staged dining table', budget: '3500' } },
    { label: 'Neglected to Charming', data: { roomName: 'Front Porch & Entry', beforeState: 'Peeling paint on front door, dead plants, cracked walkway, old doormat, bare porch', afterStyle: 'Farmhouse', changesApplied: 'Painted door sage green, new planters with seasonal flowers, new doormat, rocking chairs, string lights, house number update', budget: '1200' } },
  ],
  'market-analysis': [
    { label: 'SF Bay Area Condos', data: { region: 'San Francisco Bay Area', propertyType: 'Condo', priceRange: '$800k-$1.2M', targetSeason: 'Spring 2024' } },
    { label: 'Austin Suburban', data: { region: 'Austin, TX Metro', propertyType: 'Single Family', priceRange: '$500k-$800k', targetSeason: 'Year-round' } },
    { label: 'Miami Luxury', data: { region: 'Miami/South Beach', propertyType: 'Luxury', priceRange: '$2M+', targetSeason: 'Winter 2024' } },
  ],
  'checklist-generator': [
    { label: '7-Day Quick Stage', data: { propertyType: 'Condo', rooms: 'Living room, bedroom, kitchen, bathroom', style: 'Minimalist', timeline: '7 days', budget: '4000' } },
    { label: '14-Day Full Home', data: { propertyType: 'Single Family', rooms: 'Living room, kitchen, master bedroom, guest bedroom, dining room, 2 bathrooms, patio', style: 'Transitional', timeline: '14 days', budget: '12000' } },
    { label: '21-Day Luxury Estate', data: { propertyType: 'Penthouse', rooms: 'Great room, chef kitchen, master suite, 2 guest suites, dining room, home office, terrace, media room', style: 'Luxury', timeline: '21 days', budget: '35000' } },
  ],
  'virtual-staging': [
    { label: 'Empty Modern Studio', data: { roomType: 'Living Room', currentState: 'Completely empty studio apartment, white walls, hardwood floors, one large window, galley kitchen visible', desiredStyle: 'Modern Luxury', budget: '250' } },
    { label: 'Vacant Colonial Room', data: { roomType: 'Dining Room', currentState: 'Empty formal dining room, crown molding, chandelier present, hardwood floors, bay window', desiredStyle: 'Traditional', budget: '150' } },
    { label: 'Bare Bedroom', data: { roomType: 'Bedroom', currentState: 'Empty master bedroom, carpet flooring, two windows, walk-in closet visible, neutral paint', desiredStyle: 'Coastal', budget: '200' } },
  ],
  'property-analyzer': [
    { label: 'SF Downtown Loft', data: { propertyType: 'Condo', location: 'Downtown San Francisco, Financial District', sqft: '1800', bedrooms: '2', bathrooms: '2', age: '5 years', condition: 'Excellent', price: '1250000' } },
    { label: 'Portland Victorian', data: { propertyType: 'Single Family', location: 'Portland, OR - Historic Irvington District', sqft: '2800', bedrooms: '4', bathrooms: '3', age: '110 years', condition: 'Good', price: '875000' } },
    { label: 'Charleston Mansion', data: { propertyType: 'Luxury Estate', location: 'Charleston, SC - Historic District', sqft: '4200', bedrooms: '5', bathrooms: '4.5', age: '150 years', condition: 'Fair', price: '1650000' } },
  ],
  'room-optimizer': [
    { label: 'Dark Narrow Room', data: { roomType: 'Living Room', width: '11', length: '22', ceilingHeight: '8 ft (standard)', issues: 'Very narrow and long, feels like a hallway, only one small window on short wall, dark corners', purpose: 'Show as comfortable entertaining space' } },
    { label: 'Low Ceiling Basement', data: { roomType: 'Basement', width: '20', length: '25', ceilingHeight: '8 ft (standard)', issues: 'Low ceilings, no natural light, support columns in middle, exposed pipes', purpose: 'Show as bonus family/media room' } },
    { label: 'Awkward Attic Bedroom', data: { roomType: 'Bedroom', width: '14', length: '16', ceilingHeight: 'Sloped/attic', issues: 'Sloped ceilings on both sides, dormer window, only 5ft clearance at walls, odd angles', purpose: 'Show as cozy guest retreat or kids room' } },
  ],
  'client-proposal': [
    { label: 'Luxury Agent Pitch', data: { clientName: 'Robert Anderson', clientType: 'Real Estate Agent', propertyType: 'Penthouse', propertyAddress: '101 Sky Tower, Penthouse A, New York, NY', budget: '25000-40000', timeline: '3 weeks', goals: 'Stage luxury penthouse to attract ultra-high-net-worth buyers, achieve $3.5M+ sale price' } },
    { label: 'First-Time Seller', data: { clientName: 'Sarah Davis', clientType: 'Homeowner', propertyType: 'Single Family', propertyAddress: '777 Country Rd, Nashville, TN', budget: '5000-8000', timeline: '2 weeks', goals: 'First time selling a home, need guidance on what staging means and how it helps sell faster' } },
    { label: 'Investor Flip', data: { clientName: 'James Wilson', clientType: 'Investor', propertyType: 'Single Family', propertyAddress: '555 Renovation Lane, Austin, TX', budget: '3000-5000', timeline: '1 week', goals: 'Quick flip staging to maximize profit, minimal investment for maximum perceived value' } },
  ],
  'appointment-planner': [
    { label: 'Initial Walkthrough', data: { appointmentType: 'Initial Consultation', propertyType: 'Single Family', propertySize: '2800 sqft', clientType: 'Real Estate Agent', duration: '90 minutes', goals: 'First visit to assess property, take measurements and photos, discuss style preferences and budget' } },
    { label: 'Staging Day', data: { appointmentType: 'Staging Day', propertyType: 'Condo', propertySize: '1200 sqft', clientType: 'Homeowner', duration: '3+ hours', goals: 'Full staging installation - furniture delivery, placement, accessorizing, final styling' } },
    { label: 'Photo Prep', data: { appointmentType: 'Photography Prep', propertyType: 'Luxury Estate', propertySize: '4000 sqft', clientType: 'Real Estate Agent', duration: '2 hours', goals: 'Final staging adjustments before professional photographer arrives at 2pm, ensure every room is photo-ready' } },
  ],
  'pricing-calculator': [
    { label: 'Budget Condo Package', data: { serviceType: 'Partial Staging', propertyType: 'Condo', sqft: '900', rooms: '3', market: 'Urban Standard', duration: '30 days', extras: 'Consultation, de-staging' } },
    { label: 'Full Home Standard', data: { serviceType: 'Full Home Staging', propertyType: 'Single Family', sqft: '2400', rooms: '6', market: 'Suburban Standard', duration: '60 days', extras: 'Photography, consultation, monthly refresh, de-staging' } },
    { label: 'Luxury Full Service', data: { serviceType: 'Luxury Staging', propertyType: 'Penthouse', sqft: '3500', rooms: '7', market: 'Urban Luxury', duration: '90 days', extras: 'Professional photography, drone video, virtual tour, monthly refresh, holiday update, de-staging, open house prep' } },
  ],
  'furniture-recommender': [
    { label: 'Scandi Living Room', data: { roomType: 'Living Room', style: 'Scandinavian', budget: '4000', roomSize: '16x20 ft', existingPieces: 'None - starting from scratch', colorScheme: 'White, light oak, soft gray' } },
    { label: 'Boho Bedroom', data: { roomType: 'Bedroom', style: 'Bohemian', budget: '2500', roomSize: '14x16 ft', existingPieces: 'Queen bed frame (white metal)', colorScheme: 'Earthy tones - terracotta, sage, cream' } },
    { label: 'Luxury Dining', data: { roomType: 'Dining Room', style: 'Luxury', budget: '8000', roomSize: '16x18 ft', existingPieces: 'Existing chandelier (crystal)', colorScheme: 'Navy, gold, ivory' } },
  ],
  'vendor-matcher': [
    { label: 'Quick Flip Project', data: { serviceNeeded: 'Full Staging Package', location: 'Austin, TX', budget: '3000', timeline: 'Rush (3 days)', quality: 'Budget-friendly', projectType: 'Residential staging' } },
    { label: 'Luxury Home Staging', data: { serviceNeeded: 'Furniture Rental', location: 'Manhattan, New York', budget: '20000', timeline: '2 weeks', quality: 'Ultra-luxury', projectType: 'Luxury home staging' } },
    { label: 'Vacation Rental Setup', data: { serviceNeeded: 'Full Staging Package', location: 'Lake Tahoe, CA', budget: '7000', timeline: '1 month', quality: 'Mid-range', projectType: 'Vacation rental' } },
  ],
  'roi-calculator': [
    { label: 'Mid-Range Suburban', data: { listingPrice: '550000', stagingCost: '6500', propertyType: 'Single Family', market: 'Competitive suburban', daysOnMarket: '0', condition: 'Good' } },
    { label: 'Luxury Condo Stale', data: { listingPrice: '1800000', stagingCost: '18000', propertyType: 'Penthouse', market: 'Luxury market', daysOnMarket: '45', condition: 'Excellent' } },
    { label: 'Budget Starter Home', data: { listingPrice: '285000', stagingCost: '2500', propertyType: 'Townhouse', market: 'Buyers market', daysOnMarket: '30', condition: 'Fair' } },
  ],
  'curb-appeal': [
    { label: 'Neglected Ranch', data: { propertyType: 'Single Family', exteriorCondition: 'Needs attention', landscaping: 'Overgrown lawn, dead bushes, cracked driveway, no flowers', budget: '2500', season: 'Spring', issues: 'Faded paint, rusted mailbox, bare flower beds, dated light fixtures, cracked walkway' } },
    { label: 'Winter Cabin', data: { propertyType: 'Cabin', exteriorCondition: 'Good', landscaping: 'Pine trees, gravel path, small porch', budget: '1500', season: 'Winter', issues: 'Porch looks bare, need winter warmth, pathway needs lighting' } },
    { label: 'Luxury Estate Entry', data: { propertyType: 'Luxury Estate', exteriorCondition: 'Good', landscaping: 'Mature trees, manicured lawn, circular driveway, fountain', budget: '5000', season: 'Summer', issues: 'Entry feels underwhelming for the price point, fountain needs maintenance, gates need polish' } },
  ],
  'lighting-design': [
    { label: 'Dark Living Room', data: { roomType: 'Living Room', roomSize: '18x22 ft', naturalLight: 'Limited - north facing', currentFixtures: 'Single overhead boob light, no dimmers, one floor outlet', style: 'Contemporary', mood: 'Warm and inviting' } },
    { label: 'Luxury Master Bedroom', data: { roomType: 'Bedroom', roomSize: '16x20 ft', naturalLight: 'Abundant - south facing', currentFixtures: 'Ceiling fan with light, two wall sconces that dont work', style: 'Luxury', mood: 'Cozy and intimate' } },
    { label: 'Chef Kitchen', data: { roomType: 'Kitchen', roomSize: '14x18 ft', naturalLight: 'Moderate', currentFixtures: 'Recessed cans (too bright/clinical), under-cabinet fluorescent', style: 'Farmhouse', mood: 'Warm and inviting' } },
  ],
  'seasonal-staging': [
    { label: 'Spring Family Home', data: { season: 'Spring', propertyType: 'Single Family', style: 'Transitional', region: 'Northeast US', targetBuyer: 'Families', holidays: 'Easter, Mothers Day' } },
    { label: 'Fall Luxury Estate', data: { season: 'Fall', propertyType: 'Luxury Estate', style: 'Traditional', region: 'Pacific Northwest', targetBuyer: 'Luxury buyers', holidays: 'Thanksgiving' } },
    { label: 'Winter Beach House', data: { season: 'Winter', propertyType: 'Beach House', style: 'Coastal', region: 'California', targetBuyer: 'Retirees', holidays: 'Christmas, New Years' } },
  ],
  'decluttering-guide': [
    { label: 'Occupied Family Home', data: { propertyType: 'Single Family', rooms: 'Kitchen (overflowing cabinets), master bedroom (too much furniture), garage (packed), kids rooms (toys everywhere), bathrooms', occupancyStatus: 'Currently occupied', clutterLevel: 'Heavy - lots of personal items', timeline: '2 weeks', sensitiveItems: 'Family of 5 with 3 kids under 10, 2 dogs, work-from-home parent' } },
    { label: 'Estate Cleanout', data: { propertyType: 'Single Family', rooms: 'All rooms - 60 years of accumulated items, full attic and basement', occupancyStatus: 'Estate/inherited', clutterLevel: 'Severe - significant accumulation', timeline: '1 month', sensitiveItems: 'Deceased parents home, adult children making decisions, potential antiques mixed in' } },
    { label: 'Minimal Condo Refresh', data: { propertyType: 'Condo', rooms: 'Living room, kitchen counters, bedroom closet, bathroom vanity', occupancyStatus: 'Currently occupied', clutterLevel: 'Light - mostly organized', timeline: '3 days', sensitiveItems: 'Young professional, cooperative, just needs guidance on what to put away' } },
  ],
  'photo-staging': [
    { label: 'Magazine-Ready Luxury', data: { propertyType: 'Luxury Estate', rooms: 'Grand foyer, living room, chef kitchen, master suite, terrace, pool, 2 guest rooms, dining room', photographer: 'Twilight/dusk specialist', platform: 'Sothebys, Compass, Architectural Digest', style: 'Luxury', specialFeatures: 'Infinity pool, wine cellar, panoramic city views, Italian marble, smart home' } },
    { label: 'Standard MLS Shoot', data: { propertyType: 'Single Family', rooms: 'Living room, kitchen, master bedroom, backyard, front exterior', photographer: 'Professional real estate photographer', platform: 'MLS, Zillow, Realtor.com, Redfin', style: 'Farmhouse', specialFeatures: 'Wrap-around porch, fireplace, updated kitchen, large backyard' } },
    { label: 'Social Media Content', data: { propertyType: 'Condo', rooms: 'Open living/dining, kitchen, bedroom, bathroom, building amenities', photographer: 'DIY/agent photography', platform: 'Instagram, TikTok, Facebook Marketplace', style: 'Contemporary', specialFeatures: 'City views from 20th floor, rooftop pool access, modern finishes' } },
  ],
  'renovation-advisor': [
    { label: 'Budget Kitchen Update', data: { propertyType: 'Single Family', budget: '5000', areas: 'Kitchen only - oak cabinets from 1995, laminate counters, old appliances, fluorescent lighting', age: '30 years', goal: 'Maximize sale price', timeline: '2 weeks' } },
    { label: 'Full Pre-Sale Prep', data: { propertyType: 'Single Family', budget: '20000', areas: 'Kitchen, 2 bathrooms, all flooring, interior paint, front door, fixtures throughout', age: '25 years', goal: 'Compete with new construction', timeline: '2 months' } },
    { label: 'Historic Home Touch-Up', data: { propertyType: 'Historic Home', budget: '15000', areas: 'Preserve original features while updating kitchen, master bath, electrical, paint exterior', age: '100+ years', goal: 'Appeal to luxury buyers', timeline: '1 month' } },
  ],
  'valuation-impact': [
    { label: 'Stale Listing Rescue', data: { currentValue: '475000', propertyType: 'Single Family', stagingPlan: 'Full home staging, 5 rooms, transitional style, high-end furniture rental', market: 'Buyers market', comparables: 'Similar unstaged homes sold at $450k-$470k, one staged comp sold at $510k', condition: 'Good but dated' } },
    { label: 'Luxury Penthouse Launch', data: { currentValue: '3500000', propertyType: 'Penthouse', stagingPlan: 'Ultra-luxury staging, 8 rooms including terrace, custom art, designer furniture', market: 'Luxury niche', comparables: 'Comparable penthouses: unstaged sold $3.1M-$3.3M, staged sold $3.6M-$3.8M', condition: 'Move-in ready' } },
    { label: 'Fixer-Upper Flip', data: { currentValue: '280000', propertyType: 'Single Family', stagingPlan: 'Budget staging after renovation, 4 rooms, modern farmhouse style', market: 'Balanced market', comparables: 'Renovated homes in area selling $310k-$350k, unrenovated at $250k-$275k', condition: 'Fixer-upper' } },
  ],
  'neighborhood-strategy': [
    { label: 'Tech Hub Neighborhood', data: { neighborhood: 'South Lake Union, Seattle', demographics: 'Professionals/DINK', priceRange: '$800k-$1.2M', competition: '22 active listings, 8 are staged', trends: 'Tech layoffs slowing demand, 2% price correction, but quality homes still move fast', propertyType: 'Condo' } },
    { label: 'Family Suburb', data: { neighborhood: 'Westlake Hills, Austin TX', demographics: 'Young families', priceRange: '$500k-$800k', competition: '18 active listings, only 3 are staged', trends: 'Strong growth from California relocations, 8% YoY appreciation, top school district', propertyType: 'Single Family' } },
    { label: 'Historic Charleston', data: { neighborhood: 'South of Broad, Charleston SC', demographics: 'Affluent mixed', priceRange: '$1.2M-$2M', competition: '7 active listings, all unique historic properties', trends: 'Tourism driving investment buyers, preservation rules limit renovations, high demand for turnkey', propertyType: 'Single Family' } },
  ],
  'project-planner': [
    { label: 'Rush Condo Stage', data: { propertyType: 'Condo', rooms: '3 rooms (living, bedroom, kitchen)', budget: '3500', style: 'Contemporary', teamSize: 'Solo stager', startDate: 'Tomorrow', showingDate: '4 days from start' } },
    { label: 'Standard Family Home', data: { propertyType: 'Single Family', rooms: '6 rooms (living, dining, kitchen, master, 2 baths)', budget: '9000', style: 'Transitional', teamSize: '2 people', startDate: 'Next Monday', showingDate: '2 weeks from start' } },
    { label: 'Model Home Build-Out', data: { propertyType: 'Model Home', rooms: '10 rooms including outdoor spaces', budget: '45000', style: 'Luxury', teamSize: '5+ people', startDate: 'First of next month', showingDate: '3 weeks from start' } },
  ],
  'open-house-optimizer': [
    { label: 'Broker Open', data: { propertyType: 'Luxury Estate', style: 'Luxury', expectedVisitors: '20-50', duration: '2 hours (Tuesday 11am-1pm)', season: 'Spring', targetBuyer: 'Luxury buyers' } },
    { label: 'Sunday Open House', data: { propertyType: 'Single Family', style: 'Farmhouse', expectedVisitors: '50-100', duration: '3 hours (Sunday 1-4 PM)', season: 'Fall', targetBuyer: 'Families' } },
    { label: 'Twilight Event', data: { propertyType: 'Penthouse', style: 'Contemporary', expectedVisitors: '20-50', duration: '2 hours (Friday 5-7 PM, twilight)', season: 'Summer', targetBuyer: 'Young professionals' } },
  ],
  'social-media': [
    { label: 'Instagram Before/After', data: { platform: 'Instagram', contentType: 'Before/After Showcase', propertyType: 'Single Family', style: 'Farmhouse', targetAudience: 'Real estate agents', brandVoice: 'Professional yet approachable' } },
    { label: 'TikTok Staging Tips', data: { platform: 'TikTok', contentType: 'Staging Tips', propertyType: 'Condo', style: 'Contemporary', targetAudience: 'Homeowners selling', brandVoice: 'Fun and trendy' } },
    { label: 'LinkedIn Case Study', data: { platform: 'LinkedIn', contentType: 'Client Testimonial', propertyType: 'Luxury', style: 'Luxury Modern', targetAudience: 'Industry professionals', brandVoice: 'Educational and expert' } },
  ],
  'trend-forecaster': [
    { label: 'National Residential', data: { region: 'National (US)', propertyType: 'All residential', timeHorizon: 'Next 12 months', currentTrends: 'Warm minimalism, biophilic design, curved furniture, earth tones, japandi fusion' } },
    { label: 'Luxury West Coast', data: { region: 'West Coast', propertyType: 'Luxury', timeHorizon: 'Next 6 months', currentTrends: 'Quiet luxury, art as focal point, natural stone, integrated technology, indoor-outdoor living' } },
    { label: 'Urban Condos Northeast', data: { region: 'Northeast', propertyType: 'Condos/Urban', timeHorizon: 'Next 3 months', currentTrends: 'Compact luxury, multifunctional furniture, bold wallpaper, home office staging, maximalism return' } },
  ],
};

export default function AIFeaturePage({ feature, title }) {
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dbData, setDbData] = useState({});

  const config = aiFormConfigs[feature];
  if (!config) return <p>Unknown AI feature</p>;

  const dropdowns = featureDropdowns[feature] || [];
  const samples = samplePresets[feature] || [];

  // Fetch DB data for dropdowns
  useEffect(() => {
    setFormData({});
    setResult(null);
    const newDbData = {};
    const fetches = dropdowns.map(async (type) => {
      const ep = dropdownEndpoints[type];
      if (!ep) return;
      try {
        const res = await api.get(ep.url);
        newDbData[type] = res.data.data || [];
      } catch { newDbData[type] = []; }
    });
    Promise.all(fetches).then(() => setDbData(newDbData));
  }, [feature]);

  const handleDbSelect = (type, id) => {
    if (!id) return;
    const records = dbData[type] || [];
    const record = records.find(r => r.id === parseInt(id));
    if (!record) return;
    const mapped = mapDbToForm(feature, type, record);
    setFormData(prev => ({ ...prev, ...mapped }));
  };

  const loadSample = (sample) => {
    setFormData(sample.data);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post(`/ai/${feature}`, formData);
      setResult(res.data);
    } catch (err) {
      const status = err.response?.status;
      const msg = status === 429
        ? 'AI rate limit reached. Please wait before making more analysis requests.'
        : (err.response?.data?.error || 'Request failed. Please try again.');
      setResult({ success: false, data: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="page-header">
        <h1>{title}</h1>
      </div>
      <p style={{ color: 'var(--text-light)', marginBottom: 16 }}>{config.desc}</p>

      {/* Sample Buttons */}
      {samples.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 8, color: 'var(--text-light)' }}>
            Quick Load Sample Data:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {samples.map((s, i) => (
              <button key={i} type="button" className="btn btn-outline btn-sm" onClick={() => loadSample(s)}
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DB Dropdowns */}
      {dropdowns.length > 0 && (
        <div className="card" style={{ marginBottom: 20, padding: 16, background: '#f8fafc' }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>
            Auto-fill from existing data:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {dropdowns.map((type) => {
              const ep = dropdownEndpoints[type];
              if (!ep) return null;
              const records = dbData[type] || [];
              return (
                <div key={type}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: 4, display: 'block' }}>
                    {ep.label}
                  </label>
                  <select
                    style={{ width: '100%', padding: '8px 12px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', background: 'white' }}
                    onChange={(e) => handleDbSelect(type, e.target.value)}
                    defaultValue=""
                  >
                    <option value="">-- Select to auto-fill --</option>
                    {records.map(r => (
                      <option key={r.id} value={r.id}>{ep.display(r)}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card">
        <form className="ai-form" onSubmit={handleSubmit}>
          {config.fields.map(field => (
            <div className="form-group" key={field.name}>
              <label>{field.label}</label>
              {field.type === 'select' ? (
                <select value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}>
                  <option value="">Select...</option>
                  {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea value={formData[field.name] || ''} placeholder={field.placeholder || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} />
              ) : (
                <input type={field.type} value={formData[field.name] || ''} placeholder={field.placeholder || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} />
              )}
            </div>
          ))}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 'fit-content' }}>
            {loading ? 'Generating...' : `Generate ${title.replace('AI ', '')} Analysis`}
          </button>
        </form>
      </div>

      {loading && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="loading-spinner">
            <div className="spinner" />
            AI is analyzing your request... This may take a few seconds.
          </div>
        </div>
      )}

      {result && (
        <div className="ai-result">
          <h3>
            {result.success !== false ? '✨ AI Analysis Results' : '⚠️ Error'}
          </h3>
          <div className="ai-result-content">
            <ReactMarkdown>{result.data}</ReactMarkdown>
          </div>
          {result.model && (
            <div className="ai-result-meta">
              <span>Model: {result.model}</span>
              {result.usage && (
                <>
                  <span>Tokens: {result.usage.total_tokens?.toLocaleString()}</span>
                  <span>Prompt: {result.usage.prompt_tokens?.toLocaleString()}</span>
                  <span>Response: {result.usage.completion_tokens?.toLocaleString()}</span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
