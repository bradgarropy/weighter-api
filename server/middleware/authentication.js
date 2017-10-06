const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/user');


function authenticate(request, response, next) {

    const authorization = request.headers.authorization;

    if (!authorization) {

        const data = {
            message: 'Please provide a token.',
        };

        response.status(500);
        response.json(data);
        return;

    }

    const token = authorization.split(' ')[1];

    jsonwebtoken.verify(token, process.env.SECRET, (err, decoded) => {

        if (err) {

            const data = {
                message: 'Authentication failed.',
            };

            response.status(500);
            response.json(data);
            return;

        }

        const id = decoded.id;

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

            // set user
            request.user = doc;

            // next middleware
            next();

        });

    });

}


// exports
exports.authenticate = authenticate;
