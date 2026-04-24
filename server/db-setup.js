const { Pool } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  // Connect without database to create it
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres',
  });

  try {
    const dbName = process.env.DB_NAME || 'ai_home_staging';
    const res = await adminPool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rows.length === 0) {
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database "${dbName}" created.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('Error creating database:', err.message);
  } finally {
    await adminPool.end();
  }

  // Now connect to the app database and create tables
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'ai_home_staging',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'agent',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        address VARCHAR(500) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(50) NOT NULL,
        zip VARCHAR(20) NOT NULL,
        price DECIMAL(12,2),
        bedrooms INT,
        bathrooms DECIMAL(3,1),
        sqft INT,
        property_type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        image_url VARCHAR(500),
        description TEXT,
        user_id INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        property_id INT REFERENCES properties(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        room_type VARCHAR(50) NOT NULL,
        width DECIMAL(6,2),
        length DECIMAL(6,2),
        current_condition VARCHAR(50),
        notes TEXT,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS staging_projects (
        id SERIAL PRIMARY KEY,
        property_id INT REFERENCES properties(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        style VARCHAR(100),
        budget DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'planning',
        start_date DATE,
        end_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS furniture_inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        style VARCHAR(100),
        color VARCHAR(50),
        condition VARCHAR(50),
        purchase_price DECIMAL(10,2),
        rental_price_daily DECIMAL(10,2),
        available BOOLEAN DEFAULT true,
        image_url VARCHAR(500),
        dimensions VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        client_type VARCHAR(50),
        notes TEXT,
        total_projects INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        property_id INT REFERENCES properties(id) ON DELETE CASCADE,
        client_id INT REFERENCES clients(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        appointment_date TIMESTAMP NOT NULL,
        duration_minutes INT DEFAULT 60,
        status VARCHAR(50) DEFAULT 'scheduled',
        location VARCHAR(500),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        client_id INT REFERENCES clients(id) ON DELETE SET NULL,
        property_id INT REFERENCES properties(id) ON DELETE SET NULL,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        tax DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        due_date DATE,
        paid_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS color_palettes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        room_type VARCHAR(100),
        style VARCHAR(100),
        primary_color VARCHAR(7),
        secondary_color VARCHAR(7),
        accent_color VARCHAR(7),
        neutral_color VARCHAR(7),
        description TEXT,
        ai_generated BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS design_styles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        key_elements TEXT,
        best_for VARCHAR(255),
        price_range VARCHAR(50),
        popularity INT DEFAULT 0,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS before_after_gallery (
        id SERIAL PRIMARY KEY,
        property_id INT REFERENCES properties(id) ON DELETE CASCADE,
        room_name VARCHAR(100),
        before_description TEXT,
        after_description TEXT,
        staging_style VARCHAR(100),
        cost DECIMAL(10,2),
        impact_score INT,
        ai_description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS market_analytics (
        id SERIAL PRIMARY KEY,
        region VARCHAR(100) NOT NULL,
        property_type VARCHAR(50),
        avg_staging_cost DECIMAL(10,2),
        avg_roi_percentage DECIMAL(5,2),
        avg_days_on_market INT,
        staged_vs_unstaged_price_diff DECIMAL(5,2),
        quarter VARCHAR(10),
        year INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS vendor_directory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        website VARCHAR(500),
        rating DECIMAL(2,1),
        price_range VARCHAR(50),
        service_area VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS staging_checklists (
        id SERIAL PRIMARY KEY,
        property_id INT REFERENCES properties(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        room VARCHAR(100),
        task VARCHAR(500) NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'pending',
        assigned_to VARCHAR(255),
        due_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_staging_suggestions (
        id SERIAL PRIMARY KEY,
        room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
        suggestion_type VARCHAR(100),
        suggestion TEXT,
        estimated_cost DECIMAL(10,2),
        impact_level VARCHAR(20),
        ai_model VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS property_listings (
        id SERIAL PRIMARY KEY,
        property_id INT REFERENCES properties(id) ON DELETE CASCADE,
        listing_title VARCHAR(255),
        listing_description TEXT,
        key_features TEXT,
        target_audience VARCHAR(255),
        ai_generated BOOLEAN DEFAULT false,
        platform VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('All tables created successfully.');
  } catch (err) {
    console.error('Error creating tables:', err.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();
