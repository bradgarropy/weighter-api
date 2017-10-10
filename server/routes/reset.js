const express = require('express');
const User = require('../models/user');


// create router
const router = express.Router();


// POST /api/reset/:token
router.post('/:token', (request, response) => {

    const query = { reset_token: request.params.token };

    User.findOne(query, (err, user) => {

        if (!user) {

            const data = {
                message: 'Invalid password reset token.',
            };

            response.status(403);
            response.json(data);
            return;

        }

        if (user.reset_expiration < Date.now()) {

            const data = {
                message: 'Expired password reset token.',
            };

            response.status(403);
            response.json(data);
            return;

        }

        // validation rules
        request.checkBody('password', 'New password is required.').notEmpty();
        request.checkBody('confirmation', 'Password confirmation is required.').notEmpty();
        request.checkBody('confirmation', 'Passwords must match.').equals(request.body.password);

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

            // update user
            user.password = request.body.password;
            user.reset_token = undefined;
            user.reset_expiration = undefined;

            user.save((err, user) => {

                if (err) {

                    const data = {
                        message: 'Unable to update your password.',
                    };

                    response.status(500);
                    response.json(data);
                    return;

                }

                const data = {
                    message: 'Password updated.',
                };

                response.json(data);

            });

        });

    });

});


// exports
module.exports = router;
