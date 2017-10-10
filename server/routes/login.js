const jsonwebtoken = require('jsonwebtoken');
const express = require('express');
const User = require('../models/user');


// create router
const router = express.Router();


// POST /api/login
router.post('/', (request, response) => {

    const email = request.body.email;
    const password = request.body.password;

    // validation rules
    request.checkBody('email', 'Email is required.').notEmpty();
    request.checkBody('email', 'Email is invalid.').isEmail();
    request.checkBody('password', 'Password is required.').notEmpty();

    // validate
    request.getValidationResult().then((errors) => {

        // form errors
        if (!errors.isEmpty()) {

            const data = {
                errors: errors.useFirstErrorOnly().mapped(),
            };

            response.status(400);
            response.json(data);
            return;

        }

        // find user
        const query = { email };

        User.findOne(query, (err, user) => {

            if (err) {

                const data = {
                    message: `Unable to find user with email ${email}.`,
                };

                response.status(500);
                response.json(data);
                return;

            }

            if (!user) {

                const data = {
                    message: 'Invalid email.',
                };

                response.status(401);
                response.json(data);
                return;

            }

            // compare password
            user.comparePassword(password, (err, result) => {

                if (err) {

                    const data = {
                        message: 'Unable to validate password.',
                    };

                    response.status(500);
                    response.json(data);
                    return;

                }

                if (!result) {

                    const data = {
                        message: 'Invalid password.',
                    };

                    response.status(401);
                    response.json(data);
                    return;

                }

                // create jwt
                const payload = {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                };

                const jwt = jsonwebtoken.sign(payload, process.env.SECRET);

                // create response
                const data = {
                    token: jwt,
                };

                response.json(data);

            });

        });

    });

});


// exports
module.exports = router;
