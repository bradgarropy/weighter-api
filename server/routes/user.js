const express = require('express');
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
    request.checkBody('email', 'Email is invalid.').isEmail();
    request.checkBody('password', 'Password is required.').notEmpty();
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
    request.checkBody('email', 'Email is invalid.').isEmail();

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


// exports
module.exports = router;
