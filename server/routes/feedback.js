const nodemailer = require('nodemailer');
const express = require('express');
const auth = require('../middleware/authentication');


// create router
const router = express.Router();


// POST /api/feedback
router.post('/', auth.authenticate, (request, response) => {

    // validation rules
    request.checkBody('email', 'Email is required.').notEmpty();
    request.checkBody('email', 'Please enter a valid email.').isEmail();
    request.checkBody('feedback', 'Feedback is required.').notEmpty();

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

        const email = request.body.email;
        const feedback = request.body.feedback;
        const name = `${request.user.first_name} ${request.user.last_name}`;

        const transportOptions = {
            host: process.env.SMTP_HOSTNAME,
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            },
        };

        // create email transport
        const transport = nodemailer.createTransport(transportOptions);

        const mailOptions = {
            to: 'bradgarropy@gmail.com',
            from: {
                name,
                address: email,
            },
            subject: `Weighter - Feedback from ${name}`,
            html: `<p>${feedback}</p>`,
        };

        // send email
        transport.sendMail(mailOptions, (err, info) => {

            if (err) {

                const data = {
                    message: 'Unable to send feedback email.',
                };

                response.status(500);
                response.json(data);
                return;

            }

            const data = {
                message: 'Thank you for your feedback!',
            };

            response.json(data);

        });

    });

});


// exports
module.exports = router;
