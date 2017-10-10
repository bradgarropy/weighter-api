const bodyparser = require('body-parser');
const validator = require('express-validator');
const feedback = require('./routes/feedback');
const mongoose = require('mongoose');
const password = require('./routes/password');
const express = require('express');
const dotenv = require('dotenv');
const forgot = require('./routes/forgot');
const helmet = require('helmet');
const logger = require('./middleware/logger');
const weight = require('./routes/weight');
const reset = require('./routes/reset');
const login = require('./routes/login');
const user = require('./routes/user');
const cors = require('cors');


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
app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(logger.log);
app.use(validator());


// user routes
app.use('/api/user', user);

// login route
app.use('/api/login', login);

// password route
app.use('/api/password', password);

// forgot route
app.use('/api/forgot', forgot);

// reset route
app.use('/api/reset', reset);

// weight routes
app.use('/api/weight', weight);

// feedback route
app.use('/api/feedback', feedback);


// start application
app.listen(process.env.PORT, () => {

    console.log('Server listening on port %s.', process.env.PORT);

});
