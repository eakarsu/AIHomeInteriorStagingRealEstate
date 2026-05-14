const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// Generic CRUD factory
function createCrudRoutes(tableName, columns, searchColumns = []) {
  const r = express.Router();

  // GET all
  r.get('/', auth, async (req, res) => {
    try {
      const { search, sort, order, limit, offset } = req.query;
      let query = `SELECT * FROM ${tableName}`;
      const params = [];

      if (search && searchColumns.length > 0) {
        const searchClauses = searchColumns.map((col, i) => {
          params.push(`%${search}%`);
          return `${col}::text ILIKE $${i + 1}`;
        });
        query += ` WHERE ${searchClauses.join(' OR ')}`;
      }

      query += ` ORDER BY ${sort && columns.includes(sort) ? sort : 'id'} ${order === 'asc' ? 'ASC' : 'DESC'}`;

      if (limit) {
        params.push(parseInt(limit));
        query += ` LIMIT $${params.length}`;
      }
      if (offset) {
        params.push(parseInt(offset));
        query += ` OFFSET $${params.length}`;
      }

      const result = await pool.query(query, params);
      const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
      const total = parseInt(countResult.rows[0].count);
      const parsedLimit = limit ? parseInt(limit) : total;
      const parsedOffset = offset ? parseInt(offset) : 0;
      const page = parsedLimit > 0 ? Math.floor(parsedOffset / parsedLimit) + 1 : 1;
      res.json({
        data: result.rows,
        total,
        page,
        limit: parsedLimit,
        totalPages: parsedLimit > 0 ? Math.ceil(total / parsedLimit) : 1
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET one
  r.get('/:id', auth, async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create
  r.post('/', auth, async (req, res) => {
    try {
      const fields = columns.filter(c => c !== 'id' && c !== 'created_at' && req.body[c] !== undefined);
      const values = fields.map(f => req.body[f]);
      const placeholders = fields.map((_, i) => `$${i + 1}`);
      const result = await pool.query(
        `INSERT INTO ${tableName} (${fields.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`,
        values
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update
  r.put('/:id', auth, async (req, res) => {
    try {
      const fields = columns.filter(c => c !== 'id' && c !== 'created_at' && req.body[c] !== undefined);
      const values = fields.map(f => req.body[f]);
      const sets = fields.map((f, i) => `${f} = $${i + 1}`);
      values.push(req.params.id);
      const result = await pool.query(
        `UPDATE ${tableName} SET ${sets.join(',')} WHERE id = $${values.length} RETURNING *`,
        values
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE
  r.delete('/:id', auth, async (req, res) => {
    try {
      const result = await pool.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING *`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted successfully', item: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return r;
}

// Define routes for each table
const properties = createCrudRoutes('properties',
  ['id', 'title', 'address', 'city', 'state', 'zip', 'price', 'bedrooms', 'bathrooms', 'sqft', 'property_type', 'status', 'image_url', 'description', 'user_id', 'created_at'],
  ['title', 'address', 'city', 'state']
);

const rooms = createCrudRoutes('rooms',
  ['id', 'property_id', 'name', 'room_type', 'width', 'length', 'current_condition', 'notes', 'image_url', 'created_at'],
  ['name', 'room_type', 'notes']
);

const stagingProjects = createCrudRoutes('staging_projects',
  ['id', 'property_id', 'title', 'style', 'budget', 'status', 'start_date', 'end_date', 'notes', 'created_at'],
  ['title', 'style', 'status']
);

const furnitureInventory = createCrudRoutes('furniture_inventory',
  ['id', 'name', 'category', 'style', 'color', 'condition', 'purchase_price', 'rental_price_daily', 'available', 'image_url', 'dimensions', 'created_at'],
  ['name', 'category', 'style', 'color']
);

const clients = createCrudRoutes('clients',
  ['id', 'name', 'email', 'phone', 'company', 'client_type', 'notes', 'total_projects', 'created_at'],
  ['name', 'email', 'company', 'client_type']
);

const appointments = createCrudRoutes('appointments',
  ['id', 'property_id', 'client_id', 'title', 'appointment_date', 'duration_minutes', 'status', 'location', 'notes', 'created_at'],
  ['title', 'status', 'location']
);

const invoices = createCrudRoutes('invoices',
  ['id', 'client_id', 'property_id', 'invoice_number', 'amount', 'tax', 'total', 'status', 'due_date', 'paid_date', 'notes', 'created_at'],
  ['invoice_number', 'status']
);

const colorPalettes = createCrudRoutes('color_palettes',
  ['id', 'name', 'room_type', 'style', 'primary_color', 'secondary_color', 'accent_color', 'neutral_color', 'description', 'ai_generated', 'created_at'],
  ['name', 'room_type', 'style']
);

const designStyles = createCrudRoutes('design_styles',
  ['id', 'name', 'description', 'key_elements', 'best_for', 'price_range', 'popularity', 'image_url', 'created_at'],
  ['name', 'description', 'best_for']
);

const beforeAfterGallery = createCrudRoutes('before_after_gallery',
  ['id', 'property_id', 'room_name', 'before_description', 'after_description', 'staging_style', 'cost', 'impact_score', 'ai_description', 'created_at'],
  ['room_name', 'staging_style']
);

const marketAnalytics = createCrudRoutes('market_analytics',
  ['id', 'region', 'property_type', 'avg_staging_cost', 'avg_roi_percentage', 'avg_days_on_market', 'staged_vs_unstaged_price_diff', 'quarter', 'year', 'notes', 'created_at'],
  ['region', 'property_type']
);

const vendorDirectory = createCrudRoutes('vendor_directory',
  ['id', 'name', 'category', 'email', 'phone', 'website', 'rating', 'price_range', 'service_area', 'notes', 'created_at'],
  ['name', 'category', 'service_area']
);

const stagingChecklists = createCrudRoutes('staging_checklists',
  ['id', 'property_id', 'title', 'room', 'task', 'priority', 'status', 'assigned_to', 'due_date', 'notes', 'created_at'],
  ['title', 'task', 'room', 'status']
);

const aiStagingSuggestions = createCrudRoutes('ai_staging_suggestions',
  ['id', 'room_id', 'suggestion_type', 'suggestion', 'estimated_cost', 'impact_level', 'ai_model', 'created_at'],
  ['suggestion_type', 'suggestion']
);

const propertyListings = createCrudRoutes('property_listings',
  ['id', 'property_id', 'listing_title', 'listing_description', 'key_features', 'target_audience', 'ai_generated', 'platform', 'created_at'],
  ['listing_title', 'platform', 'target_audience']
);

module.exports = {
  properties, rooms, stagingProjects, furnitureInventory, clients,
  appointments, invoices, colorPalettes, designStyles, beforeAfterGallery,
  marketAnalytics, vendorDirectory, stagingChecklists, aiStagingSuggestions, propertyListings
};
