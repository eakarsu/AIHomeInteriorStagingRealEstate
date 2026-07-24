const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ai_home_staging',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

function requireDemoPassword() {
  const password = process.env.DEMO_PASSWORD || process.env.SEED_DEMO_PASSWORD || process.env.DEMO_SEED_PASSWORD || '';
  if (password.length < 12 || password.length > 1024) throw new Error('DEMO_PASSWORD must contain 12-1024 characters');
  return password;
}

async function seed() {
  if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Destructive demo seed refused. Set ALLOW_DEMO_SEED=true outside production.');
  }
  try {
    // Clear existing data
    await pool.query(`
      TRUNCATE users, properties, rooms, staging_projects, furniture_inventory,
      clients, appointments, invoices, color_palettes, design_styles,
      before_after_gallery, market_analytics, vendor_directory, staging_checklists,
      ai_staging_suggestions, property_listings RESTART IDENTITY CASCADE;
    `);

    // Seed Users
    const hashedPassword = await bcrypt.hash(requireDemoPassword(), 10);
    await pool.query(`
      INSERT INTO users (email, password, name, role) VALUES
      ('admin@staging.com', $1, 'Sarah Johnson', 'admin'),
      ('agent@staging.com', $1, 'Michael Chen', 'agent'),
      ('designer@staging.com', $1, 'Emma Williams', 'designer'),
      ('demo@staging.com', $1, 'Demo User', 'agent')
    `, [hashedPassword]);
    console.log('✓ Users seeded');

    // Seed Properties (15 items)
    await pool.query(`
      INSERT INTO properties (title, address, city, state, zip, price, bedrooms, bathrooms, sqft, property_type, status, description, user_id) VALUES
      ('Modern Downtown Loft', '123 Main St', 'San Francisco', 'CA', '94102', 1250000, 2, 2, 1800, 'Condo', 'active', 'Stunning modern loft with floor-to-ceiling windows and city views', 1),
      ('Victorian Heritage Home', '456 Oak Ave', 'Portland', 'OR', '97201', 875000, 4, 3, 2800, 'Single Family', 'active', 'Beautifully preserved Victorian with original hardwood floors', 2),
      ('Coastal Beach House', '789 Ocean Blvd', 'Santa Monica', 'CA', '90401', 2100000, 3, 2.5, 2200, 'Single Family', 'active', 'Steps from the beach with panoramic ocean views', 1),
      ('Luxury Penthouse Suite', '101 Sky Tower', 'New York', 'NY', '10001', 3500000, 3, 3.5, 3200, 'Penthouse', 'staging', 'Top-floor penthouse with private terrace and skyline views', 2),
      ('Suburban Family Estate', '222 Maple Dr', 'Austin', 'TX', '73301', 650000, 5, 4, 3800, 'Single Family', 'active', 'Spacious family home with pool and large backyard', 1),
      ('Industrial Chic Warehouse', '333 Brick Lane', 'Brooklyn', 'NY', '11201', 1800000, 2, 2, 2500, 'Loft', 'active', 'Converted warehouse with exposed brick and high ceilings', 2),
      ('Mediterranean Villa', '444 Sunset Ridge', 'Scottsdale', 'AZ', '85251', 1450000, 4, 3, 3500, 'Single Family', 'staging', 'Elegant Mediterranean-style home with courtyard', 1),
      ('Mountain Retreat Cabin', '555 Pine Trail', 'Aspen', 'CO', '81611', 980000, 3, 2, 2000, 'Cabin', 'active', 'Cozy mountain cabin with ski-in/ski-out access', 2),
      ('Art Deco Apartment', '666 Deco Ave', 'Miami', 'FL', '33139', 720000, 2, 2, 1500, 'Condo', 'active', 'Restored Art Deco gem in the heart of South Beach', 1),
      ('Farmhouse Revival', '777 Country Rd', 'Nashville', 'TN', '37201', 550000, 4, 2.5, 2800, 'Single Family', 'active', 'Modern farmhouse with wrap-around porch', 2),
      ('Minimalist Glass House', '888 Crystal Way', 'Palm Springs', 'CA', '92262', 1100000, 3, 2, 2400, 'Single Family', 'staging', 'Mid-century modern glass house with desert views', 1),
      ('Brownstone Townhouse', '999 Park Slope', 'Brooklyn', 'NY', '11215', 2200000, 4, 3.5, 3000, 'Townhouse', 'active', 'Classic Brooklyn brownstone fully renovated', 2),
      ('Lakefront Cottage', '111 Lake View', 'Lake Tahoe', 'CA', '96150', 890000, 3, 2, 1800, 'Cottage', 'active', 'Charming lakefront property with private dock', 1),
      ('Urban Micro-Apartment', '222 Compact St', 'Seattle', 'WA', '98101', 385000, 1, 1, 550, 'Studio', 'active', 'Brilliantly designed micro-apartment maximizing every square foot', 2),
      ('Colonial Revival Mansion', '333 Heritage Ln', 'Charleston', 'SC', '29401', 1650000, 5, 4.5, 4200, 'Single Family', 'staging', 'Grand colonial mansion with ballroom and gardens', 1),
      ('Eco-Friendly Smart Home', '444 Green Way', 'Denver', 'CO', '80201', 780000, 3, 2, 2100, 'Single Family', 'active', 'Net-zero energy home with smart automation', 2)
    `);
    console.log('✓ Properties seeded');

    // Seed Rooms (15+ items)
    await pool.query(`
      INSERT INTO rooms (property_id, name, room_type, width, length, current_condition, notes) VALUES
      (1, 'Open Living Area', 'living_room', 20, 25, 'good', 'Large open-concept space with city views'),
      (1, 'Master Bedroom', 'bedroom', 15, 18, 'good', 'En-suite with walk-in closet'),
      (1, 'Modern Kitchen', 'kitchen', 12, 15, 'excellent', 'Quartz countertops, stainless appliances'),
      (2, 'Grand Parlor', 'living_room', 18, 22, 'fair', 'Original crown molding needs highlighting'),
      (2, 'Formal Dining Room', 'dining_room', 14, 16, 'good', 'Original chandelier and wainscoting'),
      (2, 'Heritage Kitchen', 'kitchen', 12, 14, 'fair', 'Updated appliances, vintage charm'),
      (3, 'Sunlit Living Room', 'living_room', 22, 20, 'excellent', 'Floor-to-ceiling ocean views'),
      (3, 'Coastal Master Suite', 'bedroom', 16, 20, 'good', 'Private balcony overlooking the beach'),
      (4, 'Penthouse Great Room', 'living_room', 30, 25, 'excellent', 'Double-height ceilings with skyline views'),
      (4, 'Gourmet Kitchen', 'kitchen', 15, 20, 'excellent', 'Professional-grade appliances'),
      (5, 'Family Room', 'living_room', 20, 22, 'good', 'Opens to the backyard and pool area'),
      (5, 'Kids Playroom', 'bonus_room', 14, 16, 'fair', 'Needs staging for family appeal'),
      (6, 'Industrial Living Space', 'living_room', 25, 30, 'good', 'Exposed brick walls, 16ft ceilings'),
      (7, 'Courtyard Lounge', 'living_room', 18, 20, 'good', 'Indoor-outdoor living with fountain'),
      (8, 'Lodge Room', 'living_room', 20, 18, 'good', 'Stone fireplace, vaulted wood ceilings'),
      (9, 'Deco Living Room', 'living_room', 16, 18, 'fair', 'Original terrazzo floors'),
      (10, 'Farmhouse Kitchen', 'kitchen', 14, 18, 'good', 'Shiplap walls, farmhouse sink')
    `);
    console.log('✓ Rooms seeded');

    // Seed Staging Projects (15 items)
    await pool.query(`
      INSERT INTO staging_projects (property_id, title, style, budget, status, start_date, end_date, notes) VALUES
      (1, 'Downtown Loft Modern Staging', 'Contemporary', 8500, 'in_progress', '2024-03-01', '2024-03-15', 'Focus on minimalist luxury aesthetic'),
      (2, 'Victorian Elegance Revival', 'Traditional', 12000, 'completed', '2024-02-01', '2024-02-20', 'Preserve heritage while adding modern touches'),
      (3, 'Coastal Chic Transformation', 'Coastal', 15000, 'in_progress', '2024-03-10', '2024-03-25', 'Light, airy beachy vibes with luxury elements'),
      (4, 'Penthouse Luxury Staging', 'Luxury Modern', 35000, 'planning', '2024-04-01', '2024-04-20', 'High-end furniture and art pieces'),
      (5, 'Family Home Warmth Project', 'Transitional', 7500, 'in_progress', '2024-03-05', '2024-03-18', 'Warm, inviting family-friendly staging'),
      (6, 'Industrial Loft Styling', 'Industrial', 11000, 'completed', '2024-01-15', '2024-02-01', 'Raw materials meets refined living'),
      (7, 'Mediterranean Dream Setup', 'Mediterranean', 18000, 'planning', '2024-04-10', '2024-04-30', 'Terra cotta, wrought iron, lush textiles'),
      (8, 'Mountain Lodge Staging', 'Rustic', 9500, 'in_progress', '2024-03-12', '2024-03-28', 'Cozy cabin meets luxury resort'),
      (9, 'Art Deco Revival', 'Art Deco', 13000, 'planning', '2024-04-15', '2024-05-01', 'Bold geometric patterns and glamour'),
      (10, 'Modern Farmhouse Touch', 'Farmhouse', 6500, 'completed', '2024-02-10', '2024-02-25', 'Rustic charm with modern comfort'),
      (11, 'Desert Modern Oasis', 'Mid-Century Modern', 14000, 'in_progress', '2024-03-08', '2024-03-22', 'Clean lines, natural desert palette'),
      (12, 'Brooklyn Classic Staging', 'Eclectic', 20000, 'planning', '2024-04-05', '2024-04-25', 'Mix of vintage and contemporary pieces'),
      (13, 'Lakeside Comfort Project', 'Cottage', 8000, 'in_progress', '2024-03-15', '2024-03-30', 'Relaxed lakeside living aesthetic'),
      (14, 'Micro-Space Magic', 'Minimalist', 3500, 'completed', '2024-02-20', '2024-03-01', 'Maximize perceived space in small apartment'),
      (15, 'Colonial Grandeur Staging', 'Colonial', 25000, 'planning', '2024-05-01', '2024-05-20', 'Stately elegance with modern sensibility')
    `);
    console.log('✓ Staging Projects seeded');

    // Seed Furniture Inventory (15 items)
    await pool.query(`
      INSERT INTO furniture_inventory (name, category, style, color, condition, purchase_price, rental_price_daily, available, dimensions) VALUES
      ('Italian Leather Sofa', 'Seating', 'Contemporary', 'Charcoal', 'excellent', 3200, 45, true, '90"W x 38"D x 34"H'),
      ('Restoration Dining Table', 'Tables', 'Farmhouse', 'Natural Oak', 'good', 2800, 35, true, '84"L x 42"W x 30"H'),
      ('Velvet Accent Chair', 'Seating', 'Mid-Century', 'Emerald Green', 'excellent', 850, 15, true, '32"W x 30"D x 33"H'),
      ('King Platform Bed Frame', 'Bedroom', 'Modern', 'Walnut', 'excellent', 1800, 25, true, '80"L x 76"W x 14"H'),
      ('Glass Coffee Table', 'Tables', 'Contemporary', 'Clear/Gold', 'good', 650, 12, true, '48"L x 24"W x 18"H'),
      ('Antique Bookshelf', 'Storage', 'Traditional', 'Mahogany', 'fair', 1200, 18, false, '48"W x 14"D x 72"H'),
      ('Ceramic Table Lamp Set', 'Lighting', 'Transitional', 'White/Gold', 'excellent', 320, 8, true, '16"Dia x 28"H'),
      ('Woven Area Rug 8x10', 'Textiles', 'Bohemian', 'Multi', 'good', 900, 15, true, '120"L x 96"W'),
      ('Bar Cart with Accessories', 'Accent', 'Art Deco', 'Gold/Glass', 'excellent', 450, 10, true, '30"W x 16"D x 32"H'),
      ('Oversized Floor Mirror', 'Decor', 'Modern', 'Black Frame', 'excellent', 580, 12, true, '24"W x 72"H'),
      ('Outdoor Patio Set', 'Outdoor', 'Coastal', 'White/Navy', 'good', 2200, 30, true, '72"L x 36"W x 29"H'),
      ('Marble Console Table', 'Tables', 'Luxury', 'White Marble', 'excellent', 1500, 22, true, '54"W x 16"D x 32"H'),
      ('Linen Sectional Sofa', 'Seating', 'Transitional', 'Oatmeal', 'good', 2800, 40, true, '110"W x 85"D x 34"H'),
      ('Industrial Pendant Light', 'Lighting', 'Industrial', 'Matte Black', 'excellent', 280, 7, true, '14"Dia x 20"H'),
      ('Teak Bathroom Vanity', 'Bathroom', 'Scandinavian', 'Natural Teak', 'excellent', 1100, 18, true, '36"W x 22"D x 34"H'),
      ('Silk Throw Pillow Set', 'Textiles', 'Luxury', 'Assorted', 'excellent', 240, 5, true, '20"x20" (set of 4)')
    `);
    console.log('✓ Furniture Inventory seeded');

    // Seed Clients (15 items)
    await pool.query(`
      INSERT INTO clients (name, email, phone, company, client_type, notes, total_projects) VALUES
      ('Robert Anderson', 'robert@luxuryrealty.com', '(415) 555-0101', 'Luxury Realty Group', 'Real Estate Agent', 'Top producer, prefers luxury staging', 8),
      ('Jennifer Martinez', 'jmartinez@homesellers.com', '(503) 555-0102', 'Home Sellers Inc', 'Real Estate Agent', 'Specializes in first-time sellers', 5),
      ('David Kim', 'dkim@coastalprops.com', '(310) 555-0103', 'Coastal Properties', 'Real Estate Agent', 'Beach and coastal properties expert', 12),
      ('Lisa Thompson', 'lisa@designforward.com', '(212) 555-0104', 'Design Forward', 'Interior Designer', 'Collaborative staging partner', 6),
      ('James Wilson', 'jwilson@investprop.com', '(512) 555-0105', 'Investment Properties LLC', 'Investor', 'Flips 10+ houses per year', 15),
      ('Patricia Brown', 'pbrown@elitehomes.com', '(718) 555-0106', 'Elite Homes', 'Real Estate Agent', 'Brooklyn specialist', 9),
      ('Christopher Lee', 'clee@modernliving.com', '(480) 555-0107', 'Modern Living Realty', 'Real Estate Agent', 'Modern and contemporary focus', 4),
      ('Amanda Garcia', 'agarcia@mountainrealty.com', '(970) 555-0108', 'Mountain Realty', 'Real Estate Agent', 'Mountain and resort properties', 7),
      ('Thomas Wright', 'twright@artdecoestates.com', '(305) 555-0109', 'Art Deco Estates', 'Real Estate Agent', 'Historic property specialist', 3),
      ('Sarah Davis', 'sdavis@countrylife.com', '(615) 555-0110', 'Country Life Realty', 'Real Estate Agent', 'Rural and farmhouse properties', 6),
      ('Michael Taylor', 'mtaylor@techhomes.com', '(206) 555-0111', 'Tech Homes', 'Real Estate Agent', 'Smart home specialist', 8),
      ('Elizabeth Clark', 'eclark@heritagerealty.com', '(843) 555-0112', 'Heritage Realty', 'Real Estate Agent', 'Historic homes expert', 5),
      ('Daniel Harris', 'dharris@greenbuilds.com', '(303) 555-0113', 'Green Builds Co', 'Developer', 'Eco-friendly developments', 11),
      ('Karen Robinson', 'krobinson@stageright.com', '(917) 555-0114', 'Stage Right', 'Staging Company', 'Partner staging company', 20),
      ('Steven Moore', 'smoore@premierhomes.com', '(408) 555-0115', 'Premier Homes', 'Real Estate Agent', 'Silicon Valley luxury market', 10)
    `);
    console.log('✓ Clients seeded');

    // Seed Appointments (15 items)
    await pool.query(`
      INSERT INTO appointments (property_id, client_id, title, appointment_date, duration_minutes, status, location, notes) VALUES
      (1, 1, 'Initial Staging Consultation', '2024-03-20 10:00', 90, 'scheduled', '123 Main St, San Francisco', 'Walk-through and style discussion'),
      (2, 2, 'Victorian Home Assessment', '2024-03-21 14:00', 60, 'scheduled', '456 Oak Ave, Portland', 'Evaluate original features to preserve'),
      (3, 3, 'Beach House Style Planning', '2024-03-22 11:00', 75, 'confirmed', '789 Ocean Blvd, Santa Monica', 'Coastal theme selection'),
      (4, 4, 'Penthouse Design Review', '2024-03-23 09:00', 120, 'scheduled', '101 Sky Tower, New York', 'Review furniture selections'),
      (5, 5, 'Family Home Quick Stage', '2024-03-24 13:00', 45, 'confirmed', '222 Maple Dr, Austin', 'Budget-friendly staging plan'),
      (6, 6, 'Warehouse Loft Walkthrough', '2024-03-25 10:30', 60, 'scheduled', '333 Brick Lane, Brooklyn', 'Assess industrial space potential'),
      (7, 7, 'Villa Staging Kickoff', '2024-03-26 15:00', 90, 'confirmed', '444 Sunset Ridge, Scottsdale', 'Mediterranean theme deep dive'),
      (8, 8, 'Cabin Cozy Setup', '2024-03-27 11:00', 60, 'scheduled', '555 Pine Trail, Aspen', 'Winter staging approach'),
      (9, 9, 'Art Deco Restoration Chat', '2024-03-28 14:30', 75, 'scheduled', '666 Deco Ave, Miami', 'Period-appropriate staging'),
      (10, 10, 'Farmhouse Staging Review', '2024-03-29 10:00', 60, 'completed', '777 Country Rd, Nashville', 'Final walkthrough before photos'),
      (11, 11, 'Glass House Photography', '2024-03-30 08:00', 120, 'scheduled', '888 Crystal Way, Palm Springs', 'Professional photo staging'),
      (12, 12, 'Brownstone Final Touch', '2024-03-31 13:00', 45, 'confirmed', '999 Park Slope, Brooklyn', 'Last adjustments before open house'),
      (13, 13, 'Lakefront Property Tour', '2024-04-01 10:00', 90, 'scheduled', '111 Lake View, Lake Tahoe', 'Seasonal staging discussion'),
      (14, 14, 'Micro-Apartment Magic', '2024-04-02 11:30', 60, 'confirmed', '222 Compact St, Seattle', 'Space optimization consultation'),
      (15, 15, 'Colonial Mansion Planning', '2024-04-03 09:00', 120, 'scheduled', '333 Heritage Ln, Charleston', 'Grand staging blueprint session')
    `);
    console.log('✓ Appointments seeded');

    // Seed Invoices (15 items)
    await pool.query(`
      INSERT INTO invoices (client_id, property_id, invoice_number, amount, tax, total, status, due_date, paid_date, notes) VALUES
      (1, 1, 'INV-2024-001', 8500, 722.50, 9222.50, 'paid', '2024-03-15', '2024-03-10', 'Downtown loft staging complete'),
      (2, 2, 'INV-2024-002', 12000, 1020.00, 13020.00, 'paid', '2024-02-28', '2024-02-25', 'Victorian home full staging'),
      (3, 3, 'INV-2024-003', 15000, 1275.00, 16275.00, 'pending', '2024-04-01', NULL, 'Coastal staging in progress'),
      (4, 4, 'INV-2024-004', 35000, 2975.00, 37975.00, 'draft', '2024-05-01', NULL, 'Penthouse luxury staging estimate'),
      (5, 5, 'INV-2024-005', 7500, 637.50, 8137.50, 'pending', '2024-03-30', NULL, 'Family home staging'),
      (6, 6, 'INV-2024-006', 11000, 935.00, 11935.00, 'paid', '2024-02-15', '2024-02-12', 'Industrial loft staging'),
      (7, 7, 'INV-2024-007', 18000, 1530.00, 19530.00, 'draft', '2024-05-15', NULL, 'Mediterranean villa staging plan'),
      (8, 8, 'INV-2024-008', 9500, 807.50, 10307.50, 'pending', '2024-04-10', NULL, 'Mountain cabin staging'),
      (9, 9, 'INV-2024-009', 13000, 1105.00, 14105.00, 'draft', '2024-05-15', NULL, 'Art deco apartment staging'),
      (10, 10, 'INV-2024-010', 6500, 552.50, 7052.50, 'paid', '2024-03-01', '2024-02-28', 'Farmhouse staging complete'),
      (11, 11, 'INV-2024-011', 14000, 1190.00, 15190.00, 'pending', '2024-04-05', NULL, 'Glass house staging'),
      (12, 12, 'INV-2024-012', 20000, 1700.00, 21700.00, 'draft', '2024-05-01', NULL, 'Brownstone full staging'),
      (13, 13, 'INV-2024-013', 8000, 680.00, 8680.00, 'pending', '2024-04-15', NULL, 'Lakefront cottage staging'),
      (14, 14, 'INV-2024-014', 3500, 297.50, 3797.50, 'paid', '2024-03-10', '2024-03-08', 'Micro apartment staging'),
      (15, 15, 'INV-2024-015', 25000, 2125.00, 27125.00, 'draft', '2024-06-01', NULL, 'Colonial mansion staging plan')
    `);
    console.log('✓ Invoices seeded');

    // Seed Color Palettes (15 items)
    await pool.query(`
      INSERT INTO color_palettes (name, room_type, style, primary_color, secondary_color, accent_color, neutral_color, description) VALUES
      ('Serene Coastal', 'living_room', 'Coastal', '#4A90D9', '#87CEEB', '#F5A623', '#F5F5DC', 'Ocean-inspired blues with warm sandy accents'),
      ('Modern Monochrome', 'bedroom', 'Contemporary', '#2C3E50', '#7F8C8D', '#E74C3C', '#ECF0F1', 'Sophisticated grays with bold red accent'),
      ('Farmhouse Warmth', 'kitchen', 'Farmhouse', '#8B7355', '#DEB887', '#556B2F', '#FFFFF0', 'Warm earth tones with sage green accent'),
      ('Luxury Gold', 'living_room', 'Luxury', '#1A1A2E', '#C9B037', '#E8D5B7', '#F8F8FF', 'Deep navy with luxurious gold accents'),
      ('Scandinavian Light', 'bedroom', 'Scandinavian', '#FFFFFF', '#D3D3D3', '#4A7C59', '#F5F5F5', 'Clean whites with natural green touches'),
      ('Mediterranean Sun', 'dining_room', 'Mediterranean', '#CC5500', '#FDB813', '#1E90FF', '#FFF8DC', 'Warm terracotta with sunny yellows and blue'),
      ('Industrial Edge', 'living_room', 'Industrial', '#36454F', '#8B8682', '#B87333', '#D3D3D3', 'Charcoal and concrete with copper highlights'),
      ('Art Deco Glamour', 'bedroom', 'Art Deco', '#000000', '#FFD700', '#008080', '#FFFACD', 'Bold black and gold with teal jewel tones'),
      ('Bohemian Sunset', 'living_room', 'Bohemian', '#8B4513', '#FF6347', '#FFD700', '#FFF5EE', 'Rich warm tones inspired by desert sunsets'),
      ('Fresh Spring', 'bathroom', 'Transitional', '#98FB98', '#FFB6C1', '#87CEEB', '#FFFFFF', 'Soft pastels for a fresh, clean feel'),
      ('Moody Drama', 'dining_room', 'Contemporary', '#2F4F4F', '#800020', '#D4AF37', '#1C1C1C', 'Deep dramatic colors for intimate dining'),
      ('Desert Oasis', 'living_room', 'Mid-Century', '#C19A6B', '#E8DCC8', '#2E8B57', '#FAEBD7', 'Warm sand tones with desert green'),
      ('Urban Jungle', 'bedroom', 'Bohemian', '#228B22', '#8FBC8F', '#CD853F', '#F0FFF0', 'Lush greens bringing nature indoors'),
      ('Classic Elegance', 'living_room', 'Traditional', '#191970', '#B22222', '#DAA520', '#FFFAF0', 'Timeless navy and burgundy combination'),
      ('Zen Retreat', 'bathroom', 'Japanese', '#8B8589', '#D2B48C', '#556B2F', '#FFFEF2', 'Calm neutral tones for relaxation')
    `);
    console.log('✓ Color Palettes seeded');

    // Seed Design Styles (15 items)
    await pool.query(`
      INSERT INTO design_styles (name, description, key_elements, best_for, price_range, popularity) VALUES
      ('Contemporary Modern', 'Clean lines, open spaces, and current design trends', 'Neutral palette, geometric shapes, mixed materials, statement lighting', 'Urban condos, new construction', '$$$', 95),
      ('Mid-Century Modern', 'Retro-inspired design from the 1950s-60s with organic curves', 'Teak furniture, hairpin legs, bold colors, geometric patterns', 'Older homes, bungalows', '$$$', 88),
      ('Farmhouse Chic', 'Rustic charm meets modern comfort with natural materials', 'Shiplap, barn doors, mason jars, distressed wood, neutral colors', 'Suburban homes, country properties', '$$', 92),
      ('Coastal Living', 'Light and breezy beach-inspired design', 'White and blue palette, natural textures, driftwood, linen fabrics', 'Beach homes, waterfront properties', '$$$', 85),
      ('Industrial Loft', 'Raw, unfinished look celebrating building materials', 'Exposed brick, metal fixtures, concrete, Edison bulbs, leather', 'Warehouses, lofts, urban spaces', '$$', 78),
      ('Scandinavian Minimal', 'Simple, functional design with hygge warmth', 'White walls, light wood, minimal decor, cozy textiles, plants', 'Small spaces, modern apartments', '$$', 90),
      ('Traditional Elegance', 'Classic design with formal furniture and rich fabrics', 'Dark wood, crown molding, silk drapes, oriental rugs, symmetry', 'Historic homes, large estates', '$$$$', 72),
      ('Bohemian Eclectic', 'Layered, collected look with global influences', 'Mixed patterns, vintage finds, plants, macrame, global textiles', 'Creative spaces, rentals', '$', 80),
      ('Art Deco', 'Glamorous 1920s-inspired design with bold geometric patterns', 'Gold accents, velvet, geometric shapes, mirrors, bold colors', 'Historic buildings, luxury spaces', '$$$$', 65),
      ('Mediterranean', 'Warm, sun-drenched design inspired by Southern Europe', 'Terra cotta, wrought iron, arched doorways, mosaic tiles', 'Southwest homes, Spanish-style', '$$$', 70),
      ('Japanese Zen', 'Minimalist design focused on tranquility and nature', 'Natural wood, shoji screens, bonsai, water features, stone', 'Modern homes, wellness spaces', '$$$', 60),
      ('Transitional', 'Perfect blend of traditional and contemporary styles', 'Neutral palette, clean lines, comfortable furniture, subtle detail', 'Any property type', '$$$', 93),
      ('Luxury Modern', 'High-end contemporary with premium materials', 'Marble, brass, custom furniture, art, designer lighting', 'Penthouses, luxury homes', '$$$$$', 75),
      ('Rustic Mountain', 'Cozy cabin-inspired design with natural materials', 'Stone fireplace, log accents, plaid, fur throws, antler decor', 'Mountain homes, cabins', '$$', 68),
      ('Tropical Resort', 'Vacation-inspired design with lush, exotic feel', 'Bamboo, palm prints, rattan, bright colors, indoor plants', 'Vacation homes, warm climates', '$$', 55)
    `);
    console.log('✓ Design Styles seeded');

    // Seed Before/After Gallery (15 items)
    await pool.query(`
      INSERT INTO before_after_gallery (property_id, room_name, before_description, after_description, staging_style, cost, impact_score) VALUES
      (1, 'Living Room', 'Empty white room with bare hardwood floors', 'Warm contemporary space with Italian leather sofa and gallery wall', 'Contemporary', 4500, 92),
      (2, 'Parlor', 'Dated wallpaper, empty room, dusty chandelier', 'Elegant parlor with restored chandelier, velvet seating, and area rug', 'Traditional', 6200, 88),
      (3, 'Master Bedroom', 'Bare room with ocean view blocked by old curtains', 'Airy coastal retreat with sheer curtains framing ocean panorama', 'Coastal', 3800, 95),
      (4, 'Great Room', 'Massive empty space feeling cold and uninviting', 'Luxurious entertaining space with conversation areas and art collection', 'Luxury Modern', 15000, 97),
      (5, 'Kitchen', 'Outdated but functional kitchen, cluttered counters', 'Clean, organized kitchen with fresh herbs and modern accessories', 'Transitional', 1800, 85),
      (6, 'Main Space', 'Raw warehouse space, exposed pipes visible', 'Curated industrial living with zones for living, dining, and office', 'Industrial', 7500, 90),
      (7, 'Entry Courtyard', 'Overgrown, neglected courtyard with broken fountain', 'Mediterranean oasis with restored fountain, potted citrus, seating', 'Mediterranean', 5200, 93),
      (8, 'Great Room', 'Dark cabin with outdated furniture and bare walls', 'Cozy mountain lodge with upgraded fireplace mantle and plush seating', 'Rustic', 4800, 87),
      (9, 'Living Room', 'Faded deco details, mismatched furniture', 'Glamorous Art Deco revival with period-appropriate furnishings', 'Art Deco', 8500, 91),
      (10, 'Kitchen', 'Plain kitchen with basic white cabinets', 'Charming farmhouse kitchen with open shelving and vintage accessories', 'Farmhouse', 2200, 89),
      (11, 'Living Room', 'Sparse mid-century home with random furniture', 'Curated mid-century showcase with authentic period pieces', 'Mid-Century', 6800, 94),
      (12, 'Master Suite', 'Large empty bedroom in brownstone', 'Sophisticated urban retreat with four-poster bed and reading nook', 'Eclectic', 5500, 86),
      (13, 'Sunroom', 'Neglected lakefront sunroom with dirty windows', 'Bright garden room with wicker furniture and lake views featured', 'Cottage', 2800, 88),
      (14, 'Studio', 'Cramped studio apartment with no defined areas', 'Cleverly zoned micro-apartment feeling twice its size', 'Minimalist', 1500, 96),
      (15, 'Ballroom', 'Dusty empty ballroom with peeling paint', 'Grand entertaining space with restored details and elegant furnishings', 'Colonial', 12000, 90)
    `);
    console.log('✓ Before/After Gallery seeded');

    // Seed Market Analytics (15 items)
    await pool.query(`
      INSERT INTO market_analytics (region, property_type, avg_staging_cost, avg_roi_percentage, avg_days_on_market, staged_vs_unstaged_price_diff, quarter, year, notes) VALUES
      ('San Francisco Bay Area', 'Condo', 8500, 12.5, 18, 8.2, 'Q1', 2024, 'Strong condo market, staging drives quick sales'),
      ('Portland Metro', 'Single Family', 7200, 10.8, 22, 6.5, 'Q1', 2024, 'Growing market, staging becoming standard'),
      ('Los Angeles', 'Single Family', 12000, 15.2, 14, 10.1, 'Q1', 2024, 'Competitive market, staging is essential'),
      ('New York City', 'Condo', 15000, 11.5, 20, 7.8, 'Q1', 2024, 'High costs but strong ROI in luxury segment'),
      ('Austin', 'Single Family', 5500, 9.2, 25, 5.5, 'Q1', 2024, 'Emerging market with growing staging demand'),
      ('Brooklyn', 'Townhouse', 18000, 13.8, 16, 9.2, 'Q1', 2024, 'Brownstone staging premium is significant'),
      ('Scottsdale', 'Single Family', 9800, 11.0, 28, 7.0, 'Q1', 2024, 'Luxury desert market responds well to staging'),
      ('Aspen', 'Cabin', 8000, 8.5, 35, 4.5, 'Q1', 2024, 'Seasonal market, winter staging most effective'),
      ('Miami', 'Condo', 10500, 14.2, 19, 8.8, 'Q1', 2024, 'Hot market, Art Deco staging commands premium'),
      ('Nashville', 'Single Family', 4800, 10.5, 21, 6.2, 'Q1', 2024, 'Growing market with farmhouse trend demand'),
      ('Palm Springs', 'Single Family', 11000, 12.8, 24, 7.5, 'Q1', 2024, 'Mid-century staging adds significant value'),
      ('Seattle', 'Condo', 6500, 9.8, 20, 5.8, 'Q1', 2024, 'Tech buyer market values modern staging'),
      ('Charleston', 'Single Family', 14000, 11.2, 30, 6.8, 'Q1', 2024, 'Historic home staging is specialized niche'),
      ('Denver', 'Single Family', 6000, 10.2, 19, 6.0, 'Q1', 2024, 'Eco-staging emerging as unique differentiator'),
      ('Lake Tahoe', 'Cottage', 7000, 9.5, 32, 5.2, 'Q1', 2024, 'Vacation property staging for rental appeal')
    `);
    console.log('✓ Market Analytics seeded');

    // Seed Vendor Directory (15 items)
    await pool.query(`
      INSERT INTO vendor_directory (name, category, email, phone, website, rating, price_range, service_area, notes) VALUES
      ('Elite Furniture Rentals', 'Furniture Rental', 'info@elitefurniture.com', '(415) 555-2001', 'www.elitefurniture.com', 4.8, '$$$', 'Bay Area, CA', 'Premium furniture rental, fast delivery'),
      ('Fresh Bloom Florals', 'Floral Design', 'orders@freshbloom.com', '(415) 555-2002', 'www.freshbloom.com', 4.9, '$$', 'San Francisco, CA', 'Staging-specific floral arrangements'),
      ('Pro Stage Photography', 'Photography', 'book@prostagephoto.com', '(212) 555-2003', 'www.prostagephoto.com', 5.0, '$$$', 'Nationwide', 'Specialized in real estate photography'),
      ('Clean Sweep Services', 'Cleaning', 'schedule@cleansweep.com', '(503) 555-2004', 'www.cleansweep.com', 4.6, '$$', 'Portland, OR', 'Pre-staging deep cleaning specialists'),
      ('Artisan Wall Treatments', 'Painting/Wallpaper', 'quotes@artisanwalls.com', '(310) 555-2005', 'www.artisanwalls.com', 4.7, '$$$', 'Los Angeles, CA', 'Custom wall treatments and accent walls'),
      ('Luxe Linen Company', 'Textiles', 'orders@luxelinen.com', '(212) 555-2006', 'www.luxelinen.com', 4.8, '$$$$', 'New York Metro', 'Premium bedding and window treatments'),
      ('Green Thumb Staging Plants', 'Plants/Greenery', 'rent@greenthumb.com', '(512) 555-2007', 'www.greenthumbstaging.com', 4.5, '$', 'Austin, TX', 'Plant rental for staging with maintenance'),
      ('Handyman Hero', 'Repairs/Maintenance', 'help@handymanhero.com', '(718) 555-2008', 'www.handymanhero.com', 4.4, '$$', 'NYC Metro', 'Quick staging-day repairs and touch-ups'),
      ('Virtual Stage Pro', 'Virtual Staging', 'design@virtualstagepro.com', '(480) 555-2009', 'www.virtualstagepro.com', 4.6, '$$', 'Remote/National', 'AI-enhanced virtual staging services'),
      ('Scent & Ambiance Co', 'Sensory', 'orders@scentambiance.com', '(305) 555-2010', 'www.scentambiance.com', 4.3, '$', 'Florida', 'Staging scents, candles, and ambiance products'),
      ('Pacific Moving & Storage', 'Moving/Logistics', 'dispatch@pacificmoving.com', '(206) 555-2011', 'www.pacificmoving.com', 4.7, '$$$', 'West Coast', 'White-glove furniture delivery and setup'),
      ('Gallery One Art Rental', 'Art/Decor', 'curator@galleryone.com', '(843) 555-2012', 'www.galleryonerentals.com', 4.9, '$$$$', 'East Coast', 'Fine art and sculpture rentals for staging'),
      ('Smart Home Solutions', 'Technology', 'install@smarthomesol.com', '(303) 555-2013', 'www.smarthomesolutions.com', 4.5, '$$$', 'Colorado', 'Smart home setup for staging demonstrations'),
      ('Outdoor Living Designs', 'Landscaping', 'design@outdoorlivingdesigns.com', '(970) 555-2014', 'www.outdoorlivingdesigns.com', 4.6, '$$$', 'Mountain West', 'Outdoor staging and curb appeal'),
      ('Stage Door Accessories', 'Accessories/Decor', 'orders@stagedoor.com', '(615) 555-2015', 'www.stagedooraccessories.com', 4.7, '$$', 'Southeast', 'Staging accessories, books, kitchen items')
    `);
    console.log('✓ Vendor Directory seeded');

    // Seed Staging Checklists (15 items)
    await pool.query(`
      INSERT INTO staging_checklists (property_id, title, room, task, priority, status, assigned_to, due_date) VALUES
      (1, 'Loft Pre-Stage Prep', 'Living Room', 'Deep clean all windows for maximum light', 'high', 'completed', 'Clean Sweep Services', '2024-03-02'),
      (1, 'Loft Pre-Stage Prep', 'Kitchen', 'Replace cabinet hardware with brushed gold', 'medium', 'in_progress', 'Handyman Hero', '2024-03-05'),
      (2, 'Victorian Restoration', 'Parlor', 'Strip old wallpaper and apply fresh paint', 'high', 'in_progress', 'Artisan Wall Treatments', '2024-03-08'),
      (2, 'Victorian Restoration', 'Dining Room', 'Polish original hardwood floors', 'high', 'pending', 'Clean Sweep Services', '2024-03-10'),
      (3, 'Coastal Stage Setup', 'Master Bedroom', 'Install sheer white curtains on all windows', 'high', 'completed', 'Luxe Linen Company', '2024-03-11'),
      (3, 'Coastal Stage Setup', 'Living Room', 'Arrange coastal furniture package', 'high', 'in_progress', 'Elite Furniture Rentals', '2024-03-13'),
      (4, 'Penthouse Luxury Prep', 'Great Room', 'Install curated art collection on feature wall', 'high', 'pending', 'Gallery One Art Rental', '2024-04-05'),
      (4, 'Penthouse Luxury Prep', 'Kitchen', 'Stage with premium bar accessories and glassware', 'medium', 'pending', 'Stage Door Accessories', '2024-04-08'),
      (5, 'Family Home Setup', 'Backyard', 'Stage outdoor dining area by pool', 'medium', 'pending', 'Outdoor Living Designs', '2024-03-15'),
      (5, 'Family Home Setup', 'Kids Room', 'Create aspirational kids room staging', 'low', 'pending', 'Elite Furniture Rentals', '2024-03-16'),
      (6, 'Industrial Staging', 'Main Space', 'Install pendant lighting at dining area', 'high', 'completed', 'Handyman Hero', '2024-01-20'),
      (7, 'Villa Mediterranean', 'Courtyard', 'Source potted citrus trees and herbs', 'medium', 'pending', 'Green Thumb Staging Plants', '2024-04-12'),
      (8, 'Mountain Cabin', 'Lodge Room', 'Source authentic antler chandelier', 'high', 'in_progress', 'Stage Door Accessories', '2024-03-20'),
      (10, 'Farmhouse Finish', 'Kitchen', 'Install farmhouse pendant lights', 'high', 'completed', 'Handyman Hero', '2024-02-15'),
      (14, 'Micro Apartment', 'Studio', 'Install wall-mounted desk and Murphy bed', 'high', 'completed', 'Smart Home Solutions', '2024-02-22')
    `);
    console.log('✓ Staging Checklists seeded');

    // Seed AI Staging Suggestions (15 items)
    await pool.query(`
      INSERT INTO ai_staging_suggestions (room_id, suggestion_type, suggestion, estimated_cost, impact_level, ai_model) VALUES
      (1, 'Furniture Layout', 'Position the sofa facing the windows to highlight city views. Add a console table behind for depth.', 2500, 'high', 'claude-haiku'),
      (2, 'Color Scheme', 'Use warm gray walls (#9B9B9B) with white trim to complement natural light in the master bedroom.', 800, 'medium', 'claude-haiku'),
      (3, 'Accessorizing', 'Add a wooden cutting board, fresh herbs in small pots, and a fruit bowl to warm up the kitchen.', 150, 'medium', 'claude-haiku'),
      (4, 'Lighting', 'Replace overhead lighting with warm-toned floor lamps to highlight the original crown molding.', 600, 'high', 'claude-haiku'),
      (5, 'Table Setting', 'Set a formal dinner for 6 with fine china and crystal to showcase the dining rooms elegance.', 400, 'high', 'claude-haiku'),
      (6, 'Decluttering', 'Remove 60% of items from counters. Keep only a coffee maker, knife block, and small herb garden.', 0, 'high', 'claude-haiku'),
      (7, 'Window Treatment', 'Install floor-to-ceiling sheer curtains in pure white to maximize the ocean view and light.', 1200, 'high', 'claude-haiku'),
      (8, 'Bedding', 'Layer crisp white bedding with coastal blue throw pillows and a linen duvet cover.', 800, 'medium', 'claude-haiku'),
      (9, 'Art Placement', 'Install large-scale abstract art in navy and gold to create a focal point in the great room.', 3500, 'high', 'claude-haiku'),
      (10, 'Kitchen Staging', 'Display a cookbook open on a stand, artisanal olive oil bottles, and a ceramic bowl of lemons.', 200, 'medium', 'claude-haiku'),
      (11, 'Outdoor Flow', 'Open all sliding doors and stage the patio as an extension of the family room with matching furniture.', 3000, 'high', 'claude-haiku'),
      (12, 'Play Area', 'Create a stylish play corner with a modern toy shelf, plush rug, and two designer bean bags.', 700, 'medium', 'claude-haiku'),
      (13, 'Industrial Accent', 'Add leather butterfly chairs and a reclaimed wood coffee table to complement the exposed brick.', 2000, 'high', 'claude-haiku'),
      (14, 'Courtyard Design', 'Place wrought iron bistro set near fountain, add terracotta planters with trailing flowers.', 1500, 'high', 'claude-haiku'),
      (15, 'Fireplace Staging', 'Stack birch logs in fireplace, add chunky knit throws on chairs, place lanterns on mantle.', 400, 'medium', 'claude-haiku')
    `);
    console.log('✓ AI Staging Suggestions seeded');

    // Seed Property Listings (15 items)
    await pool.query(`
      INSERT INTO property_listings (property_id, listing_title, listing_description, key_features, target_audience, ai_generated, platform) VALUES
      (1, 'Stunning Modern Loft in the Heart of SF', 'Experience urban luxury in this meticulously staged downtown loft featuring soaring ceilings and panoramic city views.', 'City views, Open concept, Modern finishes, Walk to transit', 'Young professionals, Tech workers', false, 'Zillow'),
      (2, 'Timeless Victorian Charm in Portland', 'Step into history with this beautifully preserved Victorian home featuring original millwork and modern updates.', 'Original hardwood, Crown molding, Updated kitchen, Large lot', 'Families, History enthusiasts', false, 'Redfin'),
      (3, 'Beachfront Paradise in Santa Monica', 'Wake up to ocean waves in this stunning coastal retreat just steps from the sand.', 'Ocean views, Beach access, Outdoor living, Open floor plan', 'Luxury buyers, Beach lovers', false, 'Realtor.com'),
      (4, 'Crown Jewel Penthouse with Skyline Views', 'The ultimate in urban luxury living. This penthouse offers unparalleled views and world-class finishes.', 'Skyline views, Private terrace, Chef kitchen, Doorman building', 'Ultra-luxury buyers, Executives', false, 'Sothebys'),
      (5, 'Perfect Family Home with Pool in Austin', 'Your dream family home awaits with spacious rooms, a sparkling pool, and a neighborhood kids will love.', 'Pool, Large backyard, 5 bedrooms, Great schools nearby', 'Families, Relocating buyers', false, 'Zillow'),
      (6, 'Industrial Chic Loft in Brooklyn', 'Live in a piece of Brooklyn history. This converted warehouse loft blends raw industrial character with refined living.', 'Exposed brick, High ceilings, Open plan, Rooftop access', 'Artists, Creatives, Young professionals', false, 'StreetEasy'),
      (7, 'Elegant Mediterranean Villa in Scottsdale', 'Escape to your own Mediterranean oasis with this stunning villa featuring a private courtyard and mountain views.', 'Courtyard, Mountain views, Pool, Gourmet kitchen', 'Luxury buyers, Retirees', false, 'Zillow'),
      (8, 'Ski-in/Ski-out Mountain Retreat', 'Your year-round mountain escape awaits with this cozy yet luxurious cabin in the heart of Aspen.', 'Ski access, Fireplace, Mountain views, Hot tub', 'Vacation buyers, Ski enthusiasts', false, 'Realtor.com'),
      (9, 'Iconic Art Deco Gem in South Beach', 'Own a piece of Miami history in this restored Art Deco apartment with all the glamour of the era.', 'Art Deco details, Walk to beach, Restored, Rooftop pool', 'Design enthusiasts, Investors', false, 'Zillow'),
      (10, 'Charming Modern Farmhouse in Nashville', 'Southern charm meets modern design in this beautifully updated farmhouse with wrap-around porch.', 'Wrap-around porch, Shiplap walls, Updated kitchen, Large lot', 'Families, Nashville newcomers', false, 'Redfin'),
      (11, 'Iconic Glass House in Palm Springs', 'Live in a mid-century masterpiece. This glass house offers seamless indoor-outdoor desert living.', 'Desert views, Pool, Mid-century design, Smart home', 'Design enthusiasts, Luxury buyers', false, 'Compass'),
      (12, 'Classic Brooklyn Brownstone', 'The quintessential Brooklyn living experience in this fully renovated brownstone on a tree-lined street.', 'Garden level, Roof deck, Original details, 4 bedrooms', 'Families, Brooklyn devotees', false, 'StreetEasy'),
      (13, 'Lakefront Living in Tahoe', 'Your waterfront dream home with private dock and stunning lake views from every room.', 'Lake views, Private dock, Fireplace, Near slopes', 'Vacation buyers, Nature lovers', false, 'Zillow'),
      (14, 'Brilliant Micro-Living in Seattle', 'Proof that small can be extraordinary. This micro-apartment maximizes every inch with clever design.', 'Smart storage, City views, Walk score 98, Modern finishes', 'Young professionals, Minimalists', false, 'Redfin'),
      (15, 'Grand Colonial Estate in Charleston', 'Live in Southern grandeur with this magnificent colonial mansion featuring original ballroom and gardens.', 'Ballroom, Gardens, Historic register, 5 bedrooms', 'Luxury buyers, History lovers', false, 'Sothebys')
    `);
    console.log('✓ Property Listings seeded');

    console.log('\n✅ All seed data inserted successfully!');
  } catch (err) {
    console.error('Error seeding data:', err.message);
    console.error(err.stack);
  } finally {
    await pool.end();
  }
}

seed();
