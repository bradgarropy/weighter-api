const bodyparser = require('body-parser');
const validator = require('express-validator');
const mongoose = require('mongoose');
const passport = require('./middleware/passport');
const express = require('express');
const session = require('express-session');
const cookie = require('cookie-parser');
const dotenv = require('dotenv');
const helmet = require('helmet');
const logger = require('./middleware/logger');
const weight = require('./routes/weight');
const flash = require('connect-flash');
const user = require('./routes/user');
const path = require('path');


// create application
const app = express();

// load env variables
dotenv.config();


// create database
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });


// app settings
app.set('json spaces', 4);


// middleware
app.use(helmet());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(logger.log);
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookie());
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(validator());
app.use(flash());


// user routes
app.use('/user', user);

// weight routes
app.use('/api/weight', weight);


// start application
app.listen(process.env.PORT, () => {

    console.log('Server listening on port %s.', process.env.PORT);

});
