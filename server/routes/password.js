const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const auth = require('../middleware/authentication');

// create router
const router = express.Router();


// POST /api/password
router.post('/', auth.authenticate, (request, response) => {

    // validation rules
    request.checkBody('current_password', 'Current password is required.').notEmpty();
    request.checkBody('new_password', 'New password is required.').notEmpty();
    request.checkBody('confirmation', 'Password confirmation is required.').notEmpty();
    request.checkBody('confirmation', 'Passwords must match.').equals(request.body.new_password);

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

        const currentPassword = request.body.current_password;
        const newPassword = request.body.new_password;

        request.user.comparePassword(currentPassword, (err, result) => {

            if (err) {

                const data = {
                    message: 'Unable to validate your password.',
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

            bcrypt.genSalt(10, (err, salt) => {

                bcrypt.hash(newPassword, salt, (err, hash) => {

                    if (err) {

                        const data = {
                            message: 'Unable to encrypt your password.',
                        };

                        response.status(500);
                        response.json(data);
                        return;

                    }

                    // create user
                    const user = {};
                    user.password = hash;

                    User.findByIdAndUpdate(request.user._id, user, (err, doc) => {

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

    });

});


// exports
module.exports = router;
