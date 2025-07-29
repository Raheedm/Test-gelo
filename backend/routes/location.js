const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Update user location
router.post('/update', auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        'location.latitude': latitude,
        'location.longitude': longitude,
        'location.lastUpdated': new Date()
      },
      { new: true }
    ).select('-password');

    res.json({ message: 'Location updated successfully', location: user.location });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;