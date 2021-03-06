const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const passport = require("passport");

const usersRouter = require('./api/usersController');
const healthRouter = require('./api/healthController');
const gardenRouter = require('./api/gardenController');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(helmet())
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'frontend/build//static')));

app.use(passport.initialize());

if (app.get('env') === 'development') {
    require('dotenv').config();
}

// create connection to database
require('./loaders/db')

// setup passport
require("./config/passport")(passport);

app.use('/api/auth', usersRouter);
app.use('/api/health', passport.authenticate('jwt'), healthRouter);
app.use('/api/garden', gardenRouter);

if (app.get('env') === 'production') {
    app.use(express.static('frontend/build'));
    app.get('*', (req, res) => {
        console.log('Here');
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
    });
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
