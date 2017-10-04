const bodyparser = require('body-parser');
const validator = require('express-validator');
const mongoose = require('mongoose');
const password = require('./routes/password');
const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const logger = require('./middleware/logger');
const weight = require('./routes/weight');
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
app.use(validator({
    errorFormatter: function errorFormatter(param, msg, value) {

        return msg;

    },
}));


// user routes
app.use('/api/user', user);

// login route
app.use('/api/login', login);

// password route
app.use('/api/password', password);

// weight routes
app.use('/api/weight', weight);


// start application
app.listen(process.env.PORT, () => {

    console.log('Server listening on port %s.', process.env.PORT);

});
