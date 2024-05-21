const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressSession = require('express-session');
const passport = require('passport');
const User = require('./routes/users'); // Ensure you have this import
const indexRoutes = require('./routes/index');
const usersRouter = require('./routes/users');
const likeRoutes = require('./routes/like'); // Import the like routes

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Assuming serializeUser and deserializeUser functions are defined in your usersRouter file
passport.serializeUser(usersRouter.serializeUser);
passport.deserializeUser(usersRouter.deserializeUser);

// Routes
app.use('/', indexRoutes);
app.use('/users', usersRouter);
app.use(likeRoutes); // Use the like routes

// Route to update user profile
app.post('/update', ensureAuthenticated, (req, res) => {
  const { name, username } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, username }, (err, user) => {
    if (err) {
      return res.status(500).send('Error updating profile');
    }
    res.redirect('/profile'); // Redirect to the profile page
  });
});

// Middleware to check if the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.get('/some-route', async (req, res) => {
  try {
      const posts = await Post.find().populate('user');
      res.render('your-template', { posts, user: req.user });
  } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
  }
});


module.exports = app;
