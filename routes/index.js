const express = require('express');
const router = express.Router();
const User = require('./users'); // Correct import path if needed
const Post = require('./post'); // Correct import path if needed
const upload = require('./multer');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Passport configuration
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

router.post('/update', isAuthenticated, async (req, res) => {
  const { name, username } = req.body;
  try {
    await User.findByIdAndUpdate(req.user._id, { name, username });
    res.redirect('/profile');
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).send('Error updating profile');
  }
});

router.get('/', (req, res) => {
  res.render('index', { nav: false });
});

router.post('/fileupload', isAuthenticated, upload.single("image"), async (req, res) => {
  const user = await User.findOne({ username: req.user.username });
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('/profile');
});

router.post('/createpost', isAuthenticated, upload.single("postimage"), async (req, res) => {
  const user = await User.findOne({ username: req.user.username });
  const post = await Post.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename,
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.get('/show/posts', isAuthenticated, async (req, res) => {
  const user = await User.findOne({ username: req.user.username }).populate("posts");
  res.render('show', { user, nav: true });
});

router.get('/feed', isAuthenticated, async (req, res) => {
  const user = await User.findOne({ username: req.user.username });
  const posts = await Post.find().populate("user");
  res.render('feed', { user, posts, nav: true });
});

router.get('/add', isAuthenticated, async (req, res) => {
  const user = await User.findOne({ username: req.user.username }).populate("posts");
  res.render('add', { user, nav: true });
});

router.get('/register', (req, res) => {
  res.render('register', { nav: false });
});

router.post("/register", (req, res) => {
  const { name, username, email, contact } = req.body;
  const userData = new User({ name, username, email, contact });

  User.register(userData, req.body.password).then(() => {
    passport.authenticate("local")(req, res, () => {
      res.redirect("/profile");
    });
  }).catch(err => {
    console.error('Error registering user:', err);
    res.status(500).send('Error registering user');
  });
});

router.get('/profile', isAuthenticated, async (req, res) => {
  const user = await User.findOne({ username: req.user.username }).populate("posts");
  res.render('profile', { user, nav: true });
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/"
}));

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

module.exports = router;
