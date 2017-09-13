const nodemailer = require('nodemailer');
const passport = require('../middleware/passport');
const password = require('../middleware/password');
const express = require('express');
const crypto = require('crypto');
const User = require('../models/user');


// create router
const router = express.Router();


// GET /api/user
router.get('/', (request, response) => {

    const query = {};

    User.find(query, (err, docs) => {

        if (err) {

            const data = {
                message: 'Unable to get users.',
            };

            response.status(500);
            response.json(data);
            return;

        }

        response.json(docs);

    });

});


// GET /api/user/:id
router.get('/:id', (request, response) => {

    const id = request.params.id;

    User.findById(id, (err, doc) => {

        if (err) {

            const data = {
                message: `Unable to get user with id ${id}.`,
            };

            response.status(500);
            response.json(data);
            return;

        }

        if (!doc) {

            const data = {
                message: `No user exists with id ${id}.`,
            };

            response.status(404);
            response.json(data);
            return;

        }

        response.json(doc);

    });

});


// POST /api/user
router.post('/', (request, response) => {

    // validation rules
    request.checkBody('first_name', 'First name is required.').notEmpty();
    request.checkBody('last_name', 'Last name is required.').notEmpty();
    request.checkBody('email', 'Email is required.').notEmpty();
    request.checkBody('email', `Email is invalid ${request.body.email}`).isEmail();
    request.checkBody('password', 'Password is required.').notEmpty();

    // validate
    request.getValidationResult().then((errors) => {

        // form errors
        if (!errors.isEmpty()) {

            const data = {
                message: errors.useFirstErrorOnly().array()[0],
            };

            response.status(400);
            response.json(data);
            return;

        }

        // create user
        const user = new User();
        user.first_name = request.body.first_name;
        user.last_name = request.body.last_name;
        user.email = request.body.email;
        user.password = request.body.password;

        User.create(user, (err, doc) => {

            if (err) {

                const data = {
                    message: `User with email '${user.email}' already exists.`,
                };

                response.status(409);
                response.json(data);
                return;

            }

            response.json(doc);

        });

    });

});


// DELETE /api/user/:id
router.delete('/:id', (request, response) => {

    const id = request.params.id;

    User.findByIdAndRemove(id, (err, doc) => {

        if (err) {

            const data = {
                message: `Unable to delete user with id ${id}.`,
            };

            response.status(500);
            response.json(data);
            return;

        }

        if (!doc) {

            const data = {
                message: `No user exists with id ${id}.`,
            };

            response.status(404);
            response.json(data);
            return;

        }

        response.json(doc);

    });

});


// PUT /api/user/:id
router.put('/:id', (request, response) => {

    const id = request.params.id;

    // validation rules
    request.checkBody('first_name', 'First name is required.').notEmpty();
    request.checkBody('last_name', 'Last name is required.').notEmpty();
    request.checkBody('email', 'Email is required.').notEmpty();
    request.checkBody('email', `Email is invalid ${request.body.email}`).isEmail();

    // validate
    request.getValidationResult().then((errors) => {

        // form errors
        if (!errors.isEmpty()) {

            const data = {
                message: errors.useFirstErrorOnly().array()[0],
            };

            response.status(400);
            response.json(data);
            return;

        }

        // create user
        const user = {};
        user.first_name = request.body.first_name;
        user.last_name = request.body.last_name;
        user.email = request.body.email;

        // set  options
        const options = {
            new: true,
        };

        User.findByIdAndUpdate(id, user, options, (err, doc) => {

            if (err) {

                const data = {
                    message: `Unable to update user with id ${id}.`,
                };

                response.status(500);
                response.json(data);
                return;

            }

            if (!doc) {

                const data = {
                    message: `No user exists with id ${id}.`,
                };

                response.status(404);
                response.json(data);
                return;

            }

            response.json(doc);

        });

    });

});


// old code


router.post('/login', (request, response, next) => {

    const options = { successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: 'Invalid username or password.' };

    // authenticate user
    passport.authenticate('local', options)(request, response, next);


});


router.post('/logout', (request, response) => {

    request.logout();
    response.redirect('/');


});


router.post('/profile', (request, response) => {

    // validation rules
    request.checkBody('first_name', 'First name is required.').notEmpty();
    request.checkBody('last_name', 'Last name is required.').notEmpty();
    request.checkBody('email', 'Email is required.').notEmpty();
    request.checkBody('email', 'Please enter a valid email.').isEmail();

    // validate
    request.getValidationResult().then((errors) => {

        // form errors
        if (!errors.isEmpty()) {

            errors.array().forEach((error) => {

                request.flash('danger', error.msg);

            });

            response.redirect('/user/profile');
            return;

        }

        // create user
        const user = {};
        user.first_name = request.body.first_name;
        user.last_name = request.body.last_name;
        user.email = request.body.email;

        User.findByIdAndUpdate(request.user._id, user, (err, doc) => {

            // db create error
            if (err) {

                request.flash('danger', 'We encountered an issue updating your user profile.');
                response.redirect('/user/profile');
                return;

            }

            // profile update success
            response.redirect('/user/profile');


        });

    });

});


router.post('/password', (request, response) => {

    // validation rules
    request.checkBody('current_password', 'Current password is required.').notEmpty();
    request.checkBody('new_password', 'New password is required.').notEmpty();
    request.checkBody('confirmation', 'Password confirmation is required.').notEmpty();
    request.checkBody('confirmation', 'Passwords must match.').equals(request.body.new_password);

    // validate
    request.getValidationResult().then((errors) => {

        // form errors
        if (!errors.isEmpty()) {

            errors.array().forEach((error) => {

                request.flash('danger', error.msg);

            });

            response.redirect('/user/password');
            return;

        }

        password.validate(request.body.current_password, request.user.password, (err, result) => {

            // password validate error
            if (err) {

                request.flash('danger', 'We encountered an issue validating your password.');
                response.redirect('/user/password');
                return;

            }

            if (!result) {

                request.flash('danger', 'Incorrect password.');
                response.redirect('/user/password');
                return;

            }

            password.encrypt(request.body.new_password, (err, hash) => {

                // password validate error
                if (err) {

                    request.flash('danger', 'We encountered an issue encrypting your password.');
                    response.redirect('/user/password');
                    return;

                }

                // create user
                const user = {};
                user.password = hash;

                User.findByIdAndUpdate(request.user._id, user, (err, doc) => {

                    // db create error
                    if (err) {

                        request.flash('danger', 'We encountered an issue updating your password.');
                        response.redirect('/user/profile');
                        return;

                    }

                    // password update success
                    response.redirect('/user/logout');


                });

            });

        });

    });

});


router.post('/forgot', (request, response) => {

    // validation rules
    request.checkBody('email', 'Email is required.').notEmpty();
    request.checkBody('email', 'Please enter a valid email.').isEmail();

    // identify user
    User.findOne({ email: request.body.email }, (err, user) => {

        // db find error
        if (err) {

            request.flash('danger', 'There was an issue searching the database.');
            response.redirect('/user/forgot');
            return;

        }

        // user not found
        if (!user) {

            request.flash('danger', 'User with that email does not exist.');
            response.redirect('/user/forgot');
            return;

        }

        // generate reset token
        crypto.randomBytes(20, (err, buffer) => {

            // crypto error
            if (err) {

                request.flash('danger', 'There was an issue generating your password reset token.');
                response.redirect('/user/forgot');
                return;

            }

            // convert bytes to string
            user.reset_token = buffer.toString('hex');
            user.reset_expiration = Date.now() + 1800000;

            user.save((err, user) => {

                // db save error
                if (err) {

                    request.flash('danger', 'There was an issue saving the password reset token.');
                    response.redirect('/user/forgot');
                    return;

                }

                const transport_options = { host: process.env.SMTP_HOSTNAME,
                    auth: { user: process.env.SMTP_USERNAME,
                        pass: process.env.SMTP_PASSWORD } };

                // create email transport
                const transport = nodemailer.createTransport(transport_options);

                const link = `http://${request.headers.host}/user/reset/${user.reset_token}`;

                const mail_options = { to: user.email,
                    from: { name: 'Weighter', address: process.env.SMTP_USERNAME },
                    subject: 'Password Reset',
                    html: `<p>Please click on this link to reset your password.</p> \
                                              <br> \
                                              <a href="${link}">${link}</a>` };

                transport.sendMail(mail_options, (err, info) => {

                    // email error
                    if (err) {

                        request.flash('danger', 'We were unable to send your password reset email.');
                        response.redirect('/user/forgot');
                        return;

                    }

                    // user email success
                    response.redirect('/');


                });

            });

        });

    });

});


router.post('/reset/:token', (request, response) => {

    User.findOne({ reset_token: request.params.token }, (err, user) => {

        if (!user) {

            request.flash('danger', 'Password reset token is invalid.');
            response.redirect('back');
            return;

        }

        if (user.reset_expiration < Date.now()) {

            request.flash('danger', 'Password reset token has expired.');
            response.redirect('back');
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

                errors.array().forEach((error) => {

                    request.flash('danger', error.msg);

                });

                response.redirect('back');
                return;

            }

            // update user
            user.password = request.body.password;
            user.reset_token = undefined;
            user.reset_expiration = undefined;

            user.save((err, user) => {

                // db save error
                if (err) {

                    request.flash('danger', 'There was an issue updating the password.');
                    response.redirect('back');
                    return;

                }

                // password reset success
                response.render('user/login');


            });

        });

    });

});


router.post('/feedback', (request, response) => {

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

        const transport_options = { host: process.env.SMTP_HOSTNAME,
            auth: { user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD } };

        // create email transport
        const transport = nodemailer.createTransport(transport_options);

        const mail_options = { to: 'bradgarropy@gmail.com',
            from: { name, address: email },
            subject: `Weighter - Feedback from ${name}`,
            html: `<p>${feedback}</p>` };

        transport.sendMail(mail_options, (err, info) => {

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
