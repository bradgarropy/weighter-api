const bcrypt = require('bcryptjs');


function encrypt(password, callback) {

    bcrypt.genSalt(10, (err, salt) => {

        bcrypt.hash(password, salt, (err, hash) => {

            if (err) {

                console.log(err);
                throw err;

            }

            callback(err, hash);


        });

    });

}


function validate(password, hash, callback) {

    bcrypt.compare(password, hash, (err, result) => {

        if (err) {

            console.log(err);
            throw err;

        }

        callback(err, result);


    });

}


// exports
exports.validate = validate;
exports.encrypt = encrypt;
