const nodemailer = require('nodemailer');
const express = require('express');


// create router
const router = express.Router();


// POST /api/feedback
router.post('/', (request, response) => {

    // validation rules
    request.checkBody('email', 'Email is required.').notEmpty();
    request.checkBody('email', 'Please enter a valid email.').isEmail();
    request.checkBody('feedback', 'Feedback is required.').notEmpty();

    // validate
    request.getValidationResult().then((errors) => {

        // form errors
        if (!errors.isEmpty()) {

            errors.array().forEach((error) => {

                request.flash('danger', error.msg);

            });

            response.redirect('/user/feedback');
            return;

        }

        const email = request.body.email;
        const feedback = request.body.feedback;
        const name = `${request.user.first_name} ${request.user.last_name}`;

        const transportOptions = { host: process.env.SMTP_HOSTNAME,
            auth: { user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD } };

            // create email transport
        const transport = nodemailer.createTransport(transportOptions);

        const mailOptions = { to: 'bradgarropy@gmail.com',
            from: { name, address: email },
            subject: `Weighter - Feedback from ${name}`,
            html: `<p>${feedback}</p>` };

        transport.sendMail(mailOptions, (err, info) => {

            // email error
            if (err) {

                request.flash('danger', 'We were unable to send your feedback email.');
                response.redirect('/user/feedback');
                return;

            }

            // feedback email success
            request.flash('success', 'Thank you for your feedback!');
            response.redirect('/');


        });

    });

});


// exports
module.exports = router;
