const Strategy = require('passport-local').Strategy;
const passport = require('passport');
const Password = require('./password');
const User = require('../models/user');


const strat = new Strategy({ usernameField: 'email' }, ((email, password, done) => {

    const query = { email };

    User.findOne(query, (err, user) => {

        if (err) {

            return done(err);

        }

        if (!user) {

            const message = 'Incorrect email.';
            return done(null, false, { message });

        }

        Password.validate(password, user.password, (err, result) => {

            if (err) {

                console.log(err);
                throw err;

            }

            if (!result) {

                const message = 'Incorrect password.';
                return done(null, false, { message });

            }

            return done(null, user);

        });

    });

}));


passport.use(strat);


passport.serializeUser((user, done) => {

    done(null, user.id);

});


passport.deserializeUser((id, done) => {

    User.findById(id, (err, user) => {

        done(err, user);

    });

});


passport.ensure_authenticated = function ensureAuthenticated(request, response, next) {

    // authenticated
    if (request.isAuthenticated()) {

        return next();

    }

    // unauthenticated

    request.flash('danger', 'Please login.');
    response.redirect('/user/login');

};


// exports
module.exports = passport;
