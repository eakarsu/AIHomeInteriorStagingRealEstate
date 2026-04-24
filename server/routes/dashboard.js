const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/stats', auth, async (req, res) => {
  try {
    const [properties, projects, clients, invoices, furniture, appointments] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = \'active\') as active, COUNT(*) FILTER (WHERE status = \'staging\') as staging FROM properties'),
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = \'in_progress\') as in_progress, COUNT(*) FILTER (WHERE status = \'completed\') as completed FROM staging_projects'),
      pool.query('SELECT COUNT(*) as total, SUM(total_projects) as total_project_count FROM clients'),
      pool.query('SELECT COUNT(*) as total, SUM(total) FILTER (WHERE status = \'paid\') as revenue, SUM(total) FILTER (WHERE status = \'pending\') as pending FROM invoices'),
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE available = true) as available FROM furniture_inventory'),
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = \'scheduled\') as upcoming FROM appointments'),
    ]);

    res.json({
      properties: properties.rows[0],
      projects: projects.rows[0],
      clients: clients.rows[0],
      invoices: invoices.rows[0],
      furniture: furniture.rows[0],
      appointments: appointments.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
