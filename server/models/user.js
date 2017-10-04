const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


// define schema
const userSchema = mongoose.Schema({
    first_name: { type: String, required: true, unique: false },
    last_name: { type: String, required: true, unique: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: false },
    reset_token: { type: String, required: false, unique: false },
    reset_expiration: { type: Date, required: false, unique: false },
});


// password hash middleware
userSchema.pre('save', function encryptPassword(next) {

    const user = this;

    // hash password
    bcrypt.genSalt(10, (err, salt) => {

        bcrypt.hash(user.password, salt, (err, hash) => {

            if (err) {

                console.log(err);
                throw err;

            }

            user.password = hash;

            // next middleware
            next();

        });

    });

});


// password compare method
userSchema.methods.comparePassword = function comparePassword(password, callback) {

    const user = this;

    bcrypt.compare(password, user.password, (err, result) => {

        if (err) {

            console.log(err);
            throw err;

        }

        callback(err, result);

    });

};


// create model
const User = mongoose.model('User', userSchema);


// exports
module.exports = User;
