// routes/like.js
const express = require('express');
const router = express.Router();
const Post = require('./post');

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Route to like a post
router.post('/like/:postId', isAuthenticated, async (req, res) => {
    const { postId } = req.params;
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        // Add the user's ID to the likes array if not already present
        if (!post.likes.includes(req.user._id)) {
            post.likes.push(req.user._id);
            await post.save();
        }

        res.redirect('back'); // Redirect back to the previous page
    } catch (err) {
        console.error('Error liking post:', err);
        res.status(500).send('Error liking post');
    }
});

// Route to unlike a post
router.post('/unlike/:postId', isAuthenticated, async (req, res) => {
    const { postId } = req.params;
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        // Remove the user's ID from the likes array if present
        post.likes = post.likes.filter(userId => !userId.equals(req.user._id));
        await post.save();

        res.redirect('back'); // Redirect back to the previous page
    } catch (err) {
        console.error('Error unliking post:', err);
        res.status(500).send('Error unliking post');
    }
});

module.exports = router;
