const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, contact, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, contact, bio },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nearby users (for initial load)
router.get('/nearby', auth, async (req, res) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Location coordinates required' });
    }

    const users = await User.find({
      _id: { $ne: req.userId },
      isOnline: true,
      'location.latitude': { $exists: true },
      'location.longitude': { $exists: true }
    }).select('-password');

    const nearbyUsers = users.filter(user => {
      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        user.location.latitude,
        user.location.longitude
      );
      return distance <= radius;
    }).map(user => ({
      id: user._id,
      username: user.username,
      name: user.name,
      latitude: user.location.latitude,
      longitude: user.location.longitude,
      distance: Math.round(calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        user.location.latitude,
        user.location.longitude
      ))
    }));

    res.json(nearbyUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = router;