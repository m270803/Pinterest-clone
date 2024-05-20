var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession = require("express-session");
const passport = require("passport");
const profileRoutes = require('./routes/profile'); // Adjust the path as needed




var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: "hi"
}));


app.post('/update', (req, res) => {
  const { name, username } = req.body;
  // Update user in the database (pseudo-code, adjust as needed)
  User.findByIdAndUpdate(req.user.id, { name, username }, (err, user) => {
      if (err) {
          return res.status(500).send('Error updating profile');
      }
      res.redirect('./profile'); // Redirect to the profile page
  });
});

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Assuming serializeUser and deserializeUser functions are defined in your usersRouter file
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

app.use(profileRoutes);

module.exports = app;
