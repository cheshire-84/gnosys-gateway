const express = require('express');
const Service = require('../models/Service');
const verifyToken = require('../middleware/auth');
const router = express.Router();

// GET all services (PUBLIC - Anyone can view)
router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) { 
    res.status(500).json({ error: 'Failed to fetch services' }); 
  }
});

// POST new service (SECURED)
router.post('/', verifyToken, async (req, res) => {
  try {
    const newService = new Service(req.body);
    await newService.save();
    res.status(201).json(newService);
  } catch (err) { 
    res.status(500).json({ error: 'Failed to create service' }); 
  }
});

// DELETE service (SECURED)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted' });
  } catch (err) { 
    res.status(500).json({ error: 'Failed to delete service' }); 
  }
});

// PUT update service (SECURED)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(updatedService);
  } catch (err) { 
    res.status(500).json({ error: 'Failed to update service' }); 
  }
});

// CRITICAL: This is what tells Express the routes actually exist!
module.exports = router;