const nodemailer = require('nodemailer');
const express = require('express');
const crypto = require('crypto');
const User = require('../models/user');

// create router
const router = express.Router();


// POST /api/forgot
router.post('/', (request, response) => {

    // validation rules
    request.checkBody('email', 'Email is required.').notEmpty();
    request.checkBody('email', 'Please enter a valid email.').isEmail();

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
        const query = { email: request.body.email };

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

            // generate reset token
            crypto.randomBytes(20, (err, buffer) => {

                if (err) {

                    const data = {
                        message: 'Unable to generate password reset token.',
                    };

                    response.status(500);
                    response.json(data);
                    return;

                }

                // convert bytes to string
                user.reset_token = buffer.toString('hex');
                user.reset_expiration = Date.now() + 1800000;

                user.save((err, user) => {

                    if (err) {

                        const data = {
                            message: 'Unable to save password reset token.',
                        };

                        response.status(500);
                        response.json(data);
                        return;

                    }

                    const transportOptions = {
                        host: process.env.SMTP_HOSTNAME,
                        auth: {
                            user: process.env.SMTP_USERNAME,
                            pass: process.env.SMTP_PASSWORD,
                        },
                    };

                    // create email transport
                    const transport = nodemailer.createTransport(transportOptions);

                    const link = `http://localhost:8080/reset/${user.reset_token}`;

                    const mailOptions = {
                        to: user.email,
                        from: {
                            name: 'Weighter',
                            address: process.env.SMTP_USERNAME,
                        },
                        subject: 'Password Reset',
                        html: `<p>Please click on this link to reset your password.</p> \
                               <br> \
                               <a href="${link}">${link}</a>`,
                    };

                    // send email
                    transport.sendMail(mailOptions, (err, info) => {

                        if (err) {

                            const data = {
                                message: 'Unable to send password reset email.',
                            };

                            response.status(500);
                            response.json(data);
                            return;

                        }

                        const data = {
                            message: `Password reset email sent to ${user.email}.`,
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
