const express = require('express');
const Weight = require('../models/weight');
const moment = require('moment');


// create router
const router = express.Router();


// GET /api/weight
router.get('/', (request, response) => {

    const query = {};

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
router.get('/:id', (request, response) => {

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
router.post('/', (request, response) => {

    // create weight
    const weight = new Weight();
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


// exports
module.exports = router;
