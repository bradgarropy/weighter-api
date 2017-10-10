const express = require('express');
const Weight = require('../models/weight');
const moment = require('moment');
const auth = require('../middleware/authentication');


// create router
const router = express.Router();


// GET /api/weight
router.get('/', auth.authenticate, (request, response) => {

    const query = { user_id: request.user._id };

    Weight.find(query, (err, docs) => {

        if (err) {

            const data = {
                message: 'Unable to get weight entries.',
            };

            response.status(500);
            response.json(data);
            return;

        }

        response.json(docs);

    });

});


// GET /api/weight/:id
router.get('/:id', auth.authenticate, (request, response) => {

    const id = request.params.id;

    Weight.findById(id, (err, doc) => {

        if (err) {

            const data = {
                message: `Unable to get weight entry with id ${id}.`,
            };

            response.status(500);
            response.json(data);
            return;

        }

        if (!doc) {

            const data = {
                message: `No entry exists with id ${id}.`,
            };

            response.status(404);
            response.json(data);
            return;

        }

        response.json(doc);

    });

});


// POST /api/weight
router.post('/', auth.authenticate, (request, response) => {

    // validation rules
    request.checkBody('date', 'Date is required.').notEmpty();
    request.checkBody('date', `Date is invalid ${request.body.date}.`).isDate();
    request.checkBody('weight', 'Weight is required.').notEmpty();
    request.checkBody('weight', `Weight is invalid ${request.body.weight}.`).isFloat({ min: 0, max: 500 });

    // validate
    request.getValidationResult().then((errors) => {

        // form errors
        if (!errors.isEmpty()) {

            const data = {
                errors: errors.mapped(),
            };

            response.status(400);
            response.json(data);
            return;

        }

        // create weight
        const weight = new Weight();
        weight.user_id = request.user._id;
        weight.date = request.body.date;
        weight.weight = request.body.weight;

        Weight.create(weight, (err, doc) => {

            if (err) {

                const date = moment(weight.date).format('MM/DD/YYYY');
                const data = {
                    message: `Weight entry already exists on ${date}.`,
                };

                response.status(409);
                response.json(data);
                return;

            }

            response.json(doc);

        });

    });

});


// DELETE /api/weight/:id
router.delete('/:id', (request, response) => {

    const id = request.params.id;

    Weight.findByIdAndRemove(id, (err, doc) => {

        if (err) {

            const data = {
                message: `Unable to delete weight entry with id ${id}.`,
            };

            response.status(500);
            response.json(data);
            return;

        }

        if (!doc) {

            const data = {
                message: `No entry exists with id ${id}.`,
            };

            response.status(404);
            response.json(data);
            return;

        }

        response.json(doc);

    });

});


// PUT /api/weight/:id
router.put('/:id', (request, response) => {

    const id = request.params.id;

    // validation rules
    request.checkBody('date', 'Date is required.').notEmpty();
    request.checkBody('date', `Date is invalid ${request.body.date}.`).isDate();
    request.checkBody('weight', 'Weight is required.').notEmpty();
    request.checkBody('weight', `Weight is invalid ${request.body.weight}.`).isFloat({ min: 0, max: 500 });

    // validate
    request.getValidationResult().then((errors) => {

        // form errors
        if (!errors.isEmpty()) {

            const data = {
                errors: errors.mapped(),
            };

            response.status(400);
            response.json(data);
            return;

        }

        // create weight
        const weight = {};
        weight.date = request.body.date;
        weight.weight = request.body.weight;

        // set  options
        const options = {
            new: true,
        };

        Weight.findByIdAndUpdate(id, weight, options, (err, doc) => {

            if (err) {

                const data = {
                    message: `Unable to update weight entry with id ${id}.`,
                };

                response.status(500);
                response.json(data);
                return;

            }

            if (!doc) {

                const data = {
                    message: `No entry exists with id ${id}.`,
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
