const mongoose = require('mongoose');


// define schema
const weightSchema = mongoose.Schema({
    date: { type: Date, required: true, unique: true },
    weight: { type: Number, required: true, unique: false },
});


// create model
const Weight = mongoose.model('Weight', weightSchema);


// exports
module.exports = Weight;
