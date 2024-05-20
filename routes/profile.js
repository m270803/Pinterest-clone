// routes/profile.js
const express = require('express');
const router = express.Router();
const User = require('./users'); // Adjust the path as needed

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Route to handle profile update
router.post('/updateProfile', isAuthenticated, async (req, res) => {
    const { name, username } = req.body;
    try {
        // Find the user by their ID and update their name and username
        await User.findByIdAndUpdate(req.user._id, { name, username });

        // Redirect back to the profile page after update
        res.redirect('/profile');
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).send('Error updating profile');
    }
});

module.exports = router;
