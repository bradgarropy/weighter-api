const validator = require("express-validator");
const passport  = require("../middleware/passport");
const express   = require("express");
const Weight    = require("../models/weight");


// create router
const router = express.Router();


router.get("/", passport.ensure_authenticated, function(request, response) {

    let query = {user_id: request.user._id};

    Weight.find(query, function(err, weights) {

        // db find error
        if(err) {
            console.log(err);
            response.redirect("/");
            return;
        }

        response.render("weight/weight", {"weights": weights, "moment": require("moment")});
        return;

    });
});


router.post("/", function(request, response) {

    // validation rules
    request.checkBody("date",   "Date is required.").notEmpty();
    request.checkBody("date",   "Please enter a valid date.").isDate();
    request.checkBody("weight", "Weight is required.").notEmpty();
    request.checkBody("weight", "Please enter a valid weight.").isFloat({min: 0, max: 500});

    // validate
    request.getValidationResult().then(function(errors) {

        // form errors
        if(!errors.isEmpty()) {
            response.render("weight/weight", {errors: errors.array()});
            return;
        }

        // create weight
        let weight = new Weight();
        weight.user_id = request.user._id;
        weight.date    = request.body.date;
        weight.weight  = request.body.weight;

        Weight.create(weight, function(err, doc) {

            // db create error
            if(err) {
                console.log(err);
                response.redirect("/weight");
                return;
            }

            // add weight success
            response.redirect("/weight");
            return;

        });
    });
});


router.get("/:id", passport.ensure_authenticated, function(request, response) {

    let id = request.params.id;

    Weight.findById(id, function(err, weight) {

        // db find error
        if(err) {
            console.log(err);
            response.redirect("/");
            return;
        }

        response.render("weight/edit", {"weight": weight, "moment": require("moment")});
        return;

    });
});


router.patch("/:id", passport.ensure_authenticated, function(request, response) {

    let id = request.params.id;

    let weight = {};
    weight.date   = request.body.date;
    weight.weight = request.body.weight;

    Weight.findByIdAndUpdate(id, weight, function(err, weight) {

        // db find error
        if(err) {
            console.log(err);
            response.redirect("/");
            return;
        }

        // update weight success
        response.json(weight);
        return;

    });
});


router.delete("/:id", function(request, response) {

    let id = request.params.id;

    Weight.findByIdAndRemove(id, function(err, weight) {

        // db remove error
        if(err) {
            console.log(err);
            response.redirect("/weight");
            return;
        }

        // remove weight success
        response.json(weight);
        return;

    });
});


// exports
module.exports = router;
